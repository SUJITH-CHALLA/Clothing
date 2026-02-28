import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";

export async function POST(req: Request) {
    try {
        const { amount, currency = "INR" } = await req.json();

        if (!amount) {
            return NextResponse.json(
                { error: "Amount is required" },
                { status: 400 }
            );
        }

        // Razorpay requires amounts in smallest currency sub-unit (paise for INR)
        const options = {
            amount: amount * 100,
            currency,
            receipt: `receipt_${Math.random().toString(36).substring(7)}`,
        };

        const order = await razorpay.orders.create(options);
        return NextResponse.json(order);

    } catch (error: any) {
        console.error("Error creating Razorpay order:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to create order" },
            { status: 500 }
        );
    }
}
