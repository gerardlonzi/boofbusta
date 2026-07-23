export async function usdToBitcoin(
    usd:number
    ){
    
    const res = await fetch(
    "https://blockchain.info/ticker"
    );
    
    const data=await res.json();
    
    const rate=data.USD.last;
    
    return usd/rate;
    
    }