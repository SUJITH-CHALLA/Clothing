import * as React from 'react';
import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Preview,
    Section,
    Text,
    Tailwind,
    Row,
    Column,
} from '@react-email/components';

interface ReceiptEmailProps {
    orderId: string;
    customerName: string;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
        image: string;
    }>;
    total: number;
    shippingAddress: string;
}

const ReceiptEmail = ({
    orderId = "ORD-9822",
    customerName = "Valued Customer",
    items = [
        {
            name: "Phantom Oversized Tee (Volt)",
            quantity: 1,
            price: 2499,
            image: "https://clothify.shop/placeholder.png",
        }
    ],
    total = 2749,
    shippingAddress = "Mumbai, Maharashtra, 400001",
}: ReceiptEmailProps) => {
    const previewText = `Your Clothify Order ${orderId} is confirmed!`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-white font-sans text-[#121212]">
                    <Container className="mx-auto py-10 px-4 max-w-[600px]">
                        {/* Header */}
                        <Section className="mb-8">
                            <Text className="text-2xl font-bold tracking-tight text-black m-0">CLOTH<span className="text-[#a4cc00]">IFY</span></Text>
                        </Section>

                        {/* Hero */}
                        <Heading className="text-3xl font-extrabold tracking-tight mb-4">
                            Order Confirmed.
                        </Heading>
                        <Text className="text-base text-gray-600 mb-8">
                            Hey {customerName}, we've received your order and are currently processing it. We'll drop another email when it ships.
                        </Text>

                        <Hr className="border border-gray-200 my-6" />

                        {/* Order Details */}
                        <Section className="mb-8">
                            <Text className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Order ID: {orderId}</Text>

                            {items.map((item, index) => (
                                <Row key={index} className="mb-4">
                                    <Column className="w-16">
                                        <div className="h-16 w-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400 mr-4">
                                            IMG
                                        </div>
                                    </Column>
                                    <Column>
                                        <Text className="m-0 font-medium">{item.name}</Text>
                                        <Text className="m-0 text-sm text-gray-500">Qty: {item.quantity}</Text>
                                    </Column>
                                    <Column className="text-right">
                                        <Text className="m-0 font-semibold">₹{item.price}</Text>
                                    </Column>
                                </Row>
                            ))}
                        </Section>

                        <Hr className="border border-gray-200 my-6" />

                        {/* Totals & Address */}
                        <Section>
                            <Row>
                                <Column>
                                    <Text className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-2">Total Paid</Text>
                                    <Text className="text-2xl font-bold m-0">₹{total}</Text>
                                </Column>
                                <Column className="text-right">
                                    <Text className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-2">Shipping To</Text>
                                    <Text className="text-sm text-gray-600 m-0">{shippingAddress}</Text>
                                </Column>
                            </Row>
                        </Section>

                        {/* Footer */}
                        <Section className="mt-12 text-center text-gray-400 text-xs">
                            <Text>
                                © 2026 Clothify. All rights reserved. <br />
                                Premium Gen-Z Streetwear.
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default ReceiptEmail;
