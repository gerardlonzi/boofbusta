/**
 * lib/bitcoin/qr.ts
 *
 * Génère un URI Bitcoin BIP-21 et son QR code base64.
 *
 * Format BIP-21 : bitcoin:<address>?amount=<btc>&label=<label>&message=<msg>
 * Référence     : https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki
 */

import QRCode from "qrcode";

export interface BitcoinURIOptions {
  address: string;
  amount: number;       // montant en BTC
  label?: string;       // ex: "Commande #CM-1234"
  message?: string;     // ex: "Paiement SoukMarket"
}

/**
 * Construit un URI Bitcoin BIP-21 valide.
 */
export function createBitcoinURI(options: BitcoinURIOptions): string {
  const { address, amount, label, message } = options;

  const params = new URLSearchParams();
  params.set("amount", amount.toFixed(8));
  if (label) params.set("label", label);
  if (message) params.set("message", message);

  return `bitcoin:${address}?${params.toString()}`;
}

/**
 * Génère un QR code Data URL (PNG base64) à partir d'un URI Bitcoin.
 */
export async function generateBitcoinQRCode(uri: string): Promise<string> {
  try {
    return await QRCode.toDataURL(uri, {
      errorCorrectionLevel: "M", // M = meilleur compromis taille/robustesse
      margin: 2,
      width: 300,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
  } catch (err) {
    throw new Error(`[bitcoin/qr] Échec génération QR code : ${err}`);
  }
}