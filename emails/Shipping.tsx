import * as React from 'react';
import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Text,
    Tailwind,
} from '@react-email/components';

interface ShippingEmailProps {
    orderId: string;
    customerName: string;
    trackingNumber: string;
    trackingUrl: string;
}

const ShippingEmail = ({
    orderId = "ORD-9822",
    customerName = "Valued Customer",
    trackingNumber = "AWB123456789",
    trackingUrl = "https://track.clothify.shop",
}: ShippingEmailProps) => {
    const previewText = `Your Clothify Order ${orderId} is on the way!`;

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
                            It's On The Way.
                        </Heading>
                        <Text className="text-base text-gray-600 mb-8">
                            Hey {customerName}, great news. Your order #{orderId} has been shipped and is heading to your drop zone.
                        </Text>

                        <Section className="bg-[#121212] p-8 rounded-2xl text-center mb-8">
                            <Text className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-2 m-0">Tracking Number</Text>
                            <Text className="text-3xl text-[#E0FF22] font-mono font-bold tracking-wider mt-0 mb-6">{trackingNumber}</Text>

                            <Link
                                href={trackingUrl}
                                className="bg-[#E0FF22] text-black px-6 py-3 rounded-full font-bold text-sm inline-block"
                            >
                                Track Package
                            </Link>
                        </Section>

                        <Text className="text-sm text-gray-500">
                            Please allow up to 24 hours for the tracking link to update with live transit data.
                        </Text>

                        <Hr className="border border-gray-200 my-8" />

                        {/* Footer */}
                        <Section className="text-center text-gray-400 text-xs">
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

export default ShippingEmail;
