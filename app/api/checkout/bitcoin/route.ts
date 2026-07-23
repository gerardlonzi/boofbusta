/**
 * app/api/checkout/bitcoin/route.ts
 *
 * Crée une session de paiement Bitcoin pour une commande.
 *
 * Auth : JWT maison via getCurrentUser() — pas NextAuth
 */

import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError, AppError } from "@/lib/api-response";
import { BITCOIN_ADDRESS } from "@/lib/bitcoin/wallet";
import { usdToBitcoin } from "@/lib/bitcoin/exchange";
import { createBitcoinURI, generateBitcoinQRCode } from "@/lib/bitcoin/qr";

export async function POST(request: NextRequest) {
  try {
    // ── Auth ───────────────────────────────────────────────────────────────
    const user = await getCurrentUser();
    if (!user) {
      throw new AppError("Non authentifié", 401);
    }

    // ── Validation du body ─────────────────────────────────────────────────
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new AppError("Corps de requête JSON invalide", 400);
    }

    const { orderId } = body as { orderId?: unknown };

    if (!orderId || typeof orderId !== "string" || orderId.trim() === "") {
      throw new AppError("orderId est requis", 400);
    }

    // ── Chargement de la commande ──────────────────────────────────────────
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { bitcoinPayment: true },
    });

    if (!order) {
      throw new AppError("Commande introuvable", 404);
    }

    // ── Anti-IDOR : la commande doit appartenir à l'utilisateur ───────────
    if (order.userId !== user.id) {
      throw new AppError("Accès refusé", 403);
    }

    // ── Vérification du statut ─────────────────────────────────────────────
    if (order.paymentStatus === "PAID") {
      throw new AppError("Cette commande a déjà été payée", 400);
    }

    if (order.status === "CANCELLED") {
      throw new AppError("Cette commande a été annulée", 400);
    }

    // ── Idempotence : retourne le paiement existant si déjà initié ─────────
    if (order.bitcoinPayment) {
      const existing = order.bitcoinPayment;
      const uri = createBitcoinURI({
        address: existing.address,
        amount: existing.amountBTC,
        label: `Commande ${order.orderNumber}`,
        message: "Paiement",
      });
      const qrCode = await generateBitcoinQRCode(uri);

      return apiSuccess({
        address: existing.address,
        amountBTC: existing.amountBTC,
        amountUSD: existing.amountUSD,
        qrCode,
        uri,
        orderNumber: order.orderNumber,
        alreadyInitiated: true,
      });
    }

    // ── Conversion USD → BTC ───────────────────────────────────────────────
    const amountBTC = await usdToBitcoin(order.total);

    // ── Génération URI + QR ────────────────────────────────────────────────
    const uri = createBitcoinURI({
      address: BITCOIN_ADDRESS,
      amount: amountBTC,
      label: `Commande ${order.orderNumber}`,
      message: "Paiement",
    });
    const qrCode = await generateBitcoinQRCode(uri);

    // ── Persistance ────────────────────────────────────────────────────────
    await prisma.bitcoinPayment.create({
      data: {
        orderId: order.id,
        address: BITCOIN_ADDRESS,
        amountBTC,
        amountUSD: order.total,
      },
    });

    return apiSuccess({
      address: BITCOIN_ADDRESS,
      amountBTC,
      amountUSD: order.total,
      qrCode,
      uri,
      orderNumber: order.orderNumber,
      alreadyInitiated: false,
    });
  } catch (error) {
    return handleApiError(error);
  }
}