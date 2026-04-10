import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from "react";

import { subscribeToUnauthorized } from "@/api/http";
import { authClient } from "@/lib/auth-client";

type AuthStatus = "loading" | "anonymous" | "authenticated";
type AuthSession = typeof authClient.$Infer.Session;
type AuthUser = AuthSession["user"];

type AuthSessionContextValue = {
    status: AuthStatus;
    user: AuthUser | null;
    session: AuthSession | null;
    signIn: (input: { email: string; password: string }) => Promise<string | null>;
    createAccount: (input: { name: string; email: string; password: string }) => Promise<string | null>;
    signOut: () => Promise<string | null>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

export function AuthSessionProvider({ children }: PropsWithChildren) {
    const sessionQuery = authClient.useSession();
    const session = sessionQuery.data ?? null;
    const user = session?.user ?? null;
    const status: AuthStatus = sessionQuery.isPending ? "loading" : session ? "authenticated" : "anonymous";

    useEffect(() => {
        return subscribeToUnauthorized(() => {
            void sessionQuery.refetch();
        });
    }, [sessionQuery]);

    const value = useMemo<AuthSessionContextValue>(
        () => ({
            status,
            user,
            session,
            signIn: async ({ email, password }) => {
                const result = await authClient.signIn.email({
                    email,
                    password,
                });

                await sessionQuery.refetch();
                return result.error?.message ?? null;
            },
            createAccount: async ({ name, email, password }) => {
                const result = await authClient.signUp.email({
                    name,
                    email,
                    password,
                });

                await sessionQuery.refetch();
                return result.error?.message ?? null;
            },
            signOut: async () => {
                const result = await authClient.signOut();

                await sessionQuery.refetch();
                return result.error?.message ?? null;
            },
        }),
        [session, sessionQuery, status, user],
    );

    return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
    const value = useContext(AuthSessionContext);

    if (!value) {
        throw new Error("useAuthSession must be used within AuthSessionProvider");
    }

    return value;
}
