import { NextResponse } from "next/server";

const mockDiscounts: Record<string, { value: number; type: string }> = {
    VOLT: { value: 500, type: "fixed" },
    STEALTH20: { value: 20, type: "percentage" },
    FREESHIP: { value: 250, type: "fixed" },
};

export async function POST(req: Request) {
    try {
        const { code } = await req.json();

        if (!code) {
            return NextResponse.json(
                { error: "Discount code is required" },
                { status: 400 }
            );
        }

        const discount = mockDiscounts[code.toUpperCase()];

        if (discount) {
            // Example of connecting to Supabase logic eventually:
            // const { data, error } = await supabase.from('discounts').select('*').eq('code', code).single();

            return NextResponse.json({
                valid: true,
                discount: discount,
            });
        } else {
            return NextResponse.json({
                valid: false,
                error: "Invalid or expired discount code",
            });
        }
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
