/**
 * lib/bitcoin/verify.ts
 *
 * Vérifie une transaction Bitcoin via Blockstream.info.
 * - Valide le format du txid avant la requête
 * - Timeout 10 s
 * - Retourne un objet structuré plutôt que le JSON brut
 */

const TXID_REGEX = /^[a-fA-F0-9]{64}$/;

/** Nombre de confirmations requis pour considérer un paiement sécurisé */
export const REQUIRED_CONFIRMATIONS = 2;

export interface BitcoinTxStatus {
  txid: string;
  confirmed: boolean;
  confirmations: number;
  blockHeight: number | null;
  blockTime: number | null;
  /** Montant total reçu sur l'adresse cible, en satoshis */
  receivedSatoshis: number;
}

interface BlockstreamVout {
  scriptpubkey_address?: string;
  value: number; // satoshis
}

interface BlockstreamTx {
  txid: string;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_time?: number;
  };
  vout: BlockstreamVout[];
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Fetch timed out after ${ms}ms`)), ms)
    ),
  ]);
}

/**
 * Récupère et structure les informations d'une transaction Bitcoin.
 *
 * @returns `null` si le txid est introuvable ou si la requête échoue.
 */
export async function verifyBitcoinTransaction(
  txid: string,
  expectedAddress: string
): Promise<BitcoinTxStatus | null> {
  // Validation du format txid (64 hex chars)
  if (!TXID_REGEX.test(txid)) {
    console.warn(`[bitcoin/verify] txid invalide : "${txid}"`);
    return null;
  }

  let raw: BlockstreamTx;

  try {
    const res = await withTimeout(
      fetch(`https://blockstream.info/api/tx/${txid}`, { cache: "no-store" }),
      10_000
    );

    if (res.status === 404) {
      // Transaction inconnue du réseau (peut être normale si très récente)
      return null;
    }

    if (!res.ok) {
      console.error(
        `[bitcoin/verify] Blockstream API error ${res.status} pour txid ${txid}`
      );
      return null;
    }

    raw = await res.json();
  } catch (err) {
    console.error("[bitcoin/verify] Fetch failed:", err);
    return null;
  }

  // Calcul des confirmations depuis la hauteur de bloc
  // (Blockstream ne retourne pas directement le nombre de confirmations)
  let confirmations = 0;
  let blockHeight: number | null = null;
  let blockTime: number | null = null;

  if (raw.status.confirmed && raw.status.block_height) {
    blockHeight = raw.status.block_height;
    blockTime = raw.status.block_time ?? null;

    // Récupérer la hauteur actuelle pour calculer les confirmations
    try {
      const tipRes = await withTimeout(
        fetch("https://blockstream.info/api/blocks/tip/height", {
          cache: "no-store",
        }),
        5_000
      );
      if (tipRes.ok) {
        const tipHeight = Number(await tipRes.text());
        confirmations = tipHeight - blockHeight + 1;
      }
    } catch {
      // Non bloquant : on sait au moins que c'est confirmé
      confirmations = 1;
    }
  }

  // Montant reçu sur l'adresse attendue
  const receivedSatoshis = raw.vout
    .filter((o) => o.scriptpubkey_address === expectedAddress)
    .reduce((sum, o) => sum + o.value, 0);

  return {
    txid: raw.txid,
    confirmed: raw.status.confirmed,
    confirmations,
    blockHeight,
    blockTime,
    receivedSatoshis,
  };
}

/**
 * Retourne true si la transaction est suffisamment confirmée.
 */
export function isTxSufficientlyConfirmed(
  tx: BitcoinTxStatus
): boolean {
  return tx.confirmed && tx.confirmations >= REQUIRED_CONFIRMATIONS;
}

/**
 * Vérifie que le montant reçu couvre le montant attendu (en BTC).
 * Comparaison en satoshis pour éviter les erreurs float.
 */
export function isTxAmountSufficient(
  tx: BitcoinTxStatus,
  expectedBTC: number
): boolean {
  const expectedSatoshis = Math.round(expectedBTC * 1e8);
  // Tolérance de 1 satoshi pour les arrondis
  return tx.receivedSatoshis >= expectedSatoshis - 1;
}