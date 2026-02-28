import { BackgroundBlobs } from "@/components/premium/BackgroundBlobs";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex h-[100dvh] items-center justify-center overflow-hidden bg-deep-black px-4 sm:px-6">
            <BackgroundBlobs className="opacity-40" />
            <div className="relative z-10 w-full max-w-md max-h-full flex flex-col justify-center">{children}</div>
        </div>
    );
}
