/**
 * lib/bitcoin/wallet.ts
 *
 * Expose l'adresse Bitcoin du marchand depuis les variables d'environnement.
 * Valide le format mainnet/testnet au démarrage.
 */

// Regex basique pour adresses Bitcoin (P2PKH, P2SH, Bech32)
const BITCOIN_ADDRESS_REGEX =
  /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{6,87}|tb1[a-z0-9]{6,87})$/;

function loadBitcoinAddress(): string {
  const address = process.env.BITCOIN_ADDRESS;

  if (!address) {
    throw new Error(
      "[bitcoin/wallet] Variable d'environnement BITCOIN_ADDRESS manquante."
    );
  }

  if (!BITCOIN_ADDRESS_REGEX.test(address)) {
    throw new Error(
      `[bitcoin/wallet] BITCOIN_ADDRESS invalide : "${address}". ` +
        "Vérifiez qu'il s'agit d'une adresse Bitcoin valide (P2PKH, P2SH ou Bech32)."
    );
  }

  return address;
}

export const BITCOIN_ADDRESS = loadBitcoinAddress();