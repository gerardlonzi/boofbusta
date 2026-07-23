/**
 * lib/bitcoin/exchange.ts
 *
 * Convertit un montant USD en BTC.
 * - Fallback sur CoinGecko si blockchain.info est indisponible
 * - Cache mémoire 60 s pour éviter les appels répétés
 * - Timeout 8 s sur chaque fetch externe
 */

interface BlockchainTickerResponse {
    USD: { last: number };
  }
  
  interface CoinGeckoResponse {
    bitcoin: { usd: number };
  }
  
  // ─── Cache mémoire court (60 s) ──────────────────────────────────────────────
  
  let _cachedRate: number | null = null;
  let _cacheExpiry = 0;
  const CACHE_TTL_MS = 60_000; // 60 secondes
  
  // ─── Helpers ─────────────────────────────────────────────────────────────────
  
  function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Fetch timed out after ${ms}ms`)), ms)
      ),
    ]);
  }
  
  async function fetchFromBlockchainInfo(): Promise<number> {
    const res = await withTimeout(
      fetch("https://blockchain.info/ticker", { cache: "no-store" }),
      8_000
    );
    if (!res.ok) throw new Error(`blockchain.info responded ${res.status}`);
    const data: BlockchainTickerResponse = await res.json();
    const rate = data?.USD?.last;
    if (!rate || typeof rate !== "number" || rate <= 0) {
      throw new Error("Invalid rate from blockchain.info");
    }
    return rate;
  }
  
  async function fetchFromCoinGecko(): Promise<number> {
    const res = await withTimeout(
      fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
        { cache: "no-store" }
      ),
      8_000
    );
    if (!res.ok) throw new Error(`CoinGecko responded ${res.status}`);
    const data: CoinGeckoResponse = await res.json();
    const rate = data?.bitcoin?.usd;
    if (!rate || typeof rate !== "number" || rate <= 0) {
      throw new Error("Invalid rate from CoinGecko");
    }
    return rate;
  }
  
  // ─── Export principal ─────────────────────────────────────────────────────────
  
  /**
   * Retourne le taux BTC/USD (avec cache 60 s et fallback CoinGecko).
   */
  export async function getBitcoinUsdRate(): Promise<number> {
    const now = Date.now();
  
    if (_cachedRate && now < _cacheExpiry) {
      return _cachedRate;
    }
  
    let rate: number;
  
    try {
      rate = await fetchFromBlockchainInfo();
    } catch (primaryError) {
      console.warn(
        "[bitcoin/exchange] blockchain.info failed, falling back to CoinGecko:",
        primaryError
      );
      try {
        rate = await fetchFromCoinGecko();
      } catch (fallbackError) {
        console.error("[bitcoin/exchange] Both sources failed:", fallbackError);
        throw new Error(
          "Impossible de récupérer le taux BTC/USD. Veuillez réessayer."
        );
      }
    }
  
    _cachedRate = rate;
    _cacheExpiry = now + CACHE_TTL_MS;
  
    return rate;
  }
  
  /**
   * Convertit un montant USD en BTC (arrondi à 8 décimales).
   */
  export async function usdToBitcoin(usd: number): Promise<number> {
    if (usd <= 0) throw new Error("Le montant USD doit être positif.");
    const rate = await getBitcoinUsdRate();
    return Number((usd / rate).toFixed(8));
  }