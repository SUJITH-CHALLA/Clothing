import { BackgroundBlobs } from "@/components/premium/BackgroundBlobs";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex min-h-screen items-center justify-center bg-deep-black px-6">
            <BackgroundBlobs className="opacity-40" />
            <div className="relative z-10 w-full max-w-md">{children}</div>
        </div>
    );
}
