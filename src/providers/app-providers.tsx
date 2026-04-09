import { QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

import { AuthSessionProvider } from "@/features/auth/session-provider";
import { queryClient } from "@/lib/query-client";

export function AppProviders({ children }: PropsWithChildren) {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthSessionProvider>{children}</AuthSessionProvider>
        </QueryClientProvider>
    );
}
