import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = req.headers.get("x-razorpay-signature");

        if (!signature) {
            return NextResponse.json({ error: "Missing signature" }, { status: 400 });
        }

        const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "mock_webhook_secret";

        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(body)
            .digest("hex");

        if (expectedSignature !== signature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const event = JSON.parse(body);

        // Handle different webhook events
        switch (event.event) {
            case "payment.captured":
                // e.g. Sync state to Supabase, dispatch emails via Resend
                console.log("Payment captured:", event.payload.payment.entity.id);
                break;
            case "payment.failed":
                console.log("Payment failed:", event.payload.payment.entity.id);
                break;
            default:
                console.log(`Unhandled event type: ${event.event}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook processing error:", error);
        return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
    }
}
