"use client";

import { TRPCProvider } from "@/trpc/client";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <TRPCProvider>
            {children}
            <Toaster
                position="top-right"
                richColors
                closeButton
                theme="light"
            />
        </TRPCProvider>
    );
}
