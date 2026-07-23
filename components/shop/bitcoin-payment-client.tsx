"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BitcoinPaymentData {
  address: string;
  amountBTC: number;
  amountUSD: number;
  qrCode: string;
  uri: string;
  orderNumber: string;
}

type PaymentStatus =
  | "idle"
  | "loading"
  | "awaiting"       // en attente de la transaction
  | "confirming"     // tx détectée, attente confirmations
  | "confirmed"      // paiement validé
  | "error";

const POLL_INTERVAL_MS = 30_000; // 30 secondes

// ─── Helpers ─────────────────────────────────────────────────────────────────

function copyToClipboard(text: string, label: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(`${label} copié !`))
    .catch(() => toast.error("Impossible de copier"));
}

// ─── Composant ────────────────────────────────────────────────────────────────

interface Props {
  orderId: string;
}

export function BitcoinPaymentClient({ orderId }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [payment, setPayment] = useState<BitcoinPaymentData | null>(null);
  const [txid, setTxid] = useState("");
  const [confirmations, setConfirmations] = useState(0);
  const [requiredConfirmations, setRequiredConfirmations] = useState(2);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Initialisation : récupère l'adresse BTC + QR ────────────────────────
  useEffect(() => {
    async function initPayment() {
      try {
        const res = await fetch("/api/checkout/bitcoin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error?.message ?? "Erreur lors de l'initialisation");
        }

        setPayment(json.data);
        setStatus("awaiting");
      } catch (err) {
        setErrorMsg(
          err instanceof Error ? err.message : "Erreur inconnue"
        );
        setStatus("error");
      }
    }

    initPayment();
  }, [orderId]);

  // ── Vérification manuelle d'un txid ──────────────────────────────────────
  const confirmTx = useCallback(
    async (txidToCheck: string) => {
      if (!txidToCheck.trim()) {
        toast.error("Entrez d'abord votre txid");
        return;
      }

      try {
        const res = await fetch("/api/checkout/bitcoin/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, txid: txidToCheck.trim() }),
        });
        const json = await res.json();

        if (!res.ok) {
          toast.error(json.error?.message ?? "Vérification échouée");
          return;
        }

        if (json.data.alreadyPaid) {
          setStatus("confirmed");
          router.push(`/checkout/success?order=${json.data.orderNumber}`);
          return;
        }

        if (json.data.verified) {
          setStatus("confirmed");
          toast.success("Paiement Bitcoin confirmé !");
          router.push(`/checkout/success?order=${json.data.orderNumber}`);
          return;
        }

        // En cours de confirmation
        setStatus("confirming");
        setConfirmations(json.data.confirmations ?? 0);
        setRequiredConfirmations(json.data.required ?? 2);
        toast.info(
          `Transaction détectée — ${json.data.confirmations}/${json.data.required} confirmations`
        );
      } catch {
        toast.error("Erreur réseau lors de la vérification");
      }
    },
    [orderId, router]
  );

  // ── Polling automatique (si txid connu) ───────────────────────────────────
  useEffect(() => {
    if (status === "confirming" && txid) {
      pollingRef.current = setInterval(() => {
        confirmTx(txid);
      }, POLL_INTERVAL_MS);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [status, txid, confirmTx]);

  // ── Rendu ─────────────────────────────────────────────────────────────────

  if (status === "loading") {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Génération de l'adresse Bitcoin…
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="mb-4 text-red-500">{errorMsg}</p>
        <Button variant="outline" onClick={() => router.back()}>
          Retour
        </Button>
      </div>
    );
  }

  if (!payment) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">Paiement Bitcoin</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Commande <span className="font-mono font-medium">#{payment.orderNumber}</span>
      </p>

      {/* ── Statut confirming ── */}
      {status === "confirming" && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
          <p className="font-semibold text-amber-800 dark:text-amber-200">
            Transaction détectée — en attente de confirmations
          </p>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
            {confirmations} / {requiredConfirmations} confirmations reçues.
            Vérification automatique toutes les 30 s.
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-amber-200 dark:bg-amber-800">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{
                width: `${Math.min((confirmations / requiredConfirmations) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-amber-500">₿</span>
            Envoyer exactement ce montant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Montants */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-amber-50 p-3 text-center dark:bg-amber-950">
              <p className="text-xs text-muted-foreground">Montant BTC</p>
              <p className="mt-1 font-mono text-lg font-bold text-amber-600">
                {payment.amountBTC.toFixed(8)} BTC
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 h-6 text-xs"
                onClick={() =>
                  copyToClipboard(payment.amountBTC.toFixed(8), "Montant BTC")
                }
              >
                Copier
              </Button>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-xs text-muted-foreground">Équivalent USD</p>
              <p className="mt-1 text-lg font-bold">
                {formatPrice(payment.amountUSD)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Taux en temps réel
              </p>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center gap-2">
            <a href={payment.uri} title="Ouvrir dans votre wallet Bitcoin">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={payment.qrCode}
                alt="QR Code Bitcoin"
                width={200}
                height={200}
                className="rounded-lg border"
              />
            </a>
            <p className="text-xs text-muted-foreground">
              Scannez avec votre wallet ou cliquez
            </p>
          </div>

          {/* Adresse */}
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Adresse Bitcoin
            </p>
            <div className="flex items-center gap-2 rounded-lg border bg-muted px-3 py-2">
              <span className="flex-1 break-all font-mono text-xs">
                {payment.address}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 shrink-0 text-xs"
                onClick={() => copyToClipboard(payment.address, "Adresse")}
              >
                Copier
              </Button>
            </div>
          </div>

          {/* Saisie manuelle du txid */}
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Après le paiement — entrez votre TXID pour confirmer
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={txid}
                onChange={(e) => setTxid(e.target.value)}
                placeholder="Transaction ID (64 caractères hex)"
                className="flex-1 rounded-lg border bg-background px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-amber-400"
              />
              <Button
                size="sm"
                className="shrink-0 bg-amber-500 text-white hover:bg-amber-600"
                onClick={() => confirmTx(txid)}
              >
                Vérifier
              </Button>
            </div>
          </div>

          {/* Avertissements */}
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>⚠️ Envoyez <strong>exactement</strong> le montant indiqué.</li>
            <li>⏱ La confirmation peut prendre 10 – 60 min selon les frais réseau.</li>
            <li>🔒 Cette adresse est valable pour cette commande uniquement.</li>
          </ul>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.back()}
          >
            Annuler et revenir
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}