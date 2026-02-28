import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { CartProvider } from "@/hooks/useCart";

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CartProvider>
            <Navbar />
            <CartDrawer />
            <main className="min-h-screen pt-20">{children}</main>
            <Footer />
        </CartProvider>
    );
}
