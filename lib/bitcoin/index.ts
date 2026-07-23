/**
 * lib/bitcoin/index.ts — barrel export
 *
 * Usage :
 *   import { usdToBitcoin, BITCOIN_ADDRESS, createBitcoinURI, ... } from "@/lib/bitcoin"
 */

export { usdToBitcoin, getBitcoinUsdRate } from "./exchange";
export { BITCOIN_ADDRESS } from "./wallet";
export { createBitcoinURI, generateBitcoinQRCode } from "./qr";
export type { BitcoinURIOptions } from "./qr";
export {
  verifyBitcoinTransaction,
  isTxSufficientlyConfirmed,
  isTxAmountSufficient,
  REQUIRED_CONFIRMATIONS,
} from "./verify";
export type { BitcoinTxStatus } from "./verify";