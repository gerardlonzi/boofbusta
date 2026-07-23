/**
 * app/api/checkout/bitcoin/confirm/route.ts
 *
 * Vérifie qu'un txid Bitcoin est valide, confirmé et couvre le montant attendu.
 * Si tout est OK → marque la commande comme PAID via confirmOrderPayment().
 *
 * Sécurité :
 * - Auth requise
 * - Anti-IDOR : la commande doit appartenir à l'utilisateur
 * - Validation stricte du txid (64 hex chars)
 * - Vérifie le montant en satoshis (pas de float)
 */

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError, AppError } from "@/lib/api-response";
import {
  verifyBitcoinTransaction,
  isTxSufficientlyConfirmed,
  isTxAmountSufficient,
  REQUIRED_CONFIRMATIONS,
} from "@/lib/bitcoin/verify";
import { confirmOrderPayment } from "@/lib/services/order.service";

export async function POST(request: NextRequest) {
  try {
    // ── Auth ───────────────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new AppError("Non authentifié", 401);
    }

    // ── Validation du body ─────────────────────────────────────────────────
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new AppError("Corps de requête JSON invalide", 400);
    }

    const { orderId, txid } = body as { orderId?: unknown; txid?: unknown };

    if (!orderId || typeof orderId !== "string") {
      throw new AppError("orderId est requis", 400);
    }
    if (!txid || typeof txid !== "string") {
      throw new AppError("txid est requis", 400);
    }

    // ── Chargement de la commande + paiement bitcoin ───────────────────────
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { bitcoinPayment: true },
    });

    if (!order) {
      throw new AppError("Commande introuvable", 404);
    }

    // ── Anti-IDOR ──────────────────────────────────────────────────────────
    if (order.userId !== session.user.id) {
      throw new AppError("Accès refusé", 403);
    }

    if (!order.bitcoinPayment) {
      throw new AppError(
        "Aucune session de paiement Bitcoin trouvée pour cette commande",
        400
      );
    }

    if (order.paymentStatus === "PAID") {
      return apiSuccess({ alreadyPaid: true, orderNumber: order.orderNumber });
    }

    // ── Vérification blockchain ────────────────────────────────────────────
    const txStatus = await verifyBitcoinTransaction(
      txid,
      order.bitcoinPayment.address
    );

    if (!txStatus) {
      throw new AppError(
        "Transaction Bitcoin introuvable. Vérifiez le txid et réessayez dans quelques minutes.",
        404
      );
    }

    if (!isTxSufficientlyConfirmed(txStatus)) {
      return apiSuccess({
        verified: false,
        confirmations: txStatus.confirmations,
        required: REQUIRED_CONFIRMATIONS,
        message: `Transaction en attente de confirmation (${txStatus.confirmations}/${REQUIRED_CONFIRMATIONS})`,
      });
    }

    if (!isTxAmountSufficient(txStatus, order.bitcoinPayment.amountBTC)) {
      throw new AppError(
        `Montant insuffisant. Reçu : ${txStatus.receivedSatoshis} sat, ` +
          `attendu : ${Math.round(order.bitcoinPayment.amountBTC * 1e8)} sat.`,
        400
      );
    }

    // ── Mise à jour du paiement Bitcoin ────────────────────────────────────
    await prisma.bitcoinPayment.update({
      where: { orderId: order.id },
      data: {
        txid,
        confirmations: txStatus.confirmations,
        verified: true,
        paidAt: txStatus.blockTime
          ? new Date(txStatus.blockTime * 1000)
          : new Date(),
      },
    });

    // ── Confirmation de la commande (décrement stock, email, etc.) ─────────
    const confirmedOrder = await confirmOrderPayment(order.id);

    return apiSuccess({
      verified: true,
      alreadyPaid: false,
      orderNumber: confirmedOrder?.orderNumber,
      confirmations: txStatus.confirmations,
      message: "Paiement Bitcoin confirmé. Merci !",
    });
  } catch (error) {
    return handleApiError(error);
  }
}