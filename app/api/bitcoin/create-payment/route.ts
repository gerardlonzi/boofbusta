import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-response";

import { BITCOIN_ADDRESS } from "@/lib/bitcoin/wallet";
import { usdToBitcoin } from "@/lib/bitcoin/exchange";
import { createBitcoinURI } from "@/lib/bitcoin/qr";
import { generateQRCode } from "@/lib/bitcoin/generate-qr";

export async function POST(request: NextRequest) {
  try {

    const { orderId } = await request.json();

    if (!orderId) {
      throw new Error("orderId is required");
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    //----------------------------------------
    // Conversion USD -> BTC
    //----------------------------------------

    const amountBTC = await usdToBitcoin(order.total);

    //----------------------------------------
    // Bitcoin URI
    //----------------------------------------

    const uri = createBitcoinURI(
      BITCOIN_ADDRESS,
      amountBTC
    );

    //----------------------------------------
    // QR Code
    //----------------------------------------

    const qrCode = await generateQRCode(uri);

    //----------------------------------------
    // Sauvegarde
    //----------------------------------------

    await prisma.bitcoinPayment.create({
      data: {

        orderId: order.id,

        address: BITCOIN_ADDRESS,

        amountBTC,

        amountUSD: order.total,

      },
    });

    //----------------------------------------

    return apiSuccess({

      address: BITCOIN_ADDRESS,

      amountBTC,

      amountUSD: order.total,

      qrCode,

    });

  } catch (error) {
    return handleApiError(error);
  }
}