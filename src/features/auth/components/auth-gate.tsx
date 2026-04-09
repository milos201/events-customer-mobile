import type { Href } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ActionGroup, ActionLink, ScreenShell, SectionCard } from "@/ui/screen-shell";

type AuthGateProps = {
    title: string;
    returnTo: Href;
};

export function AuthGate({ title, returnTo }: AuthGateProps) {
    return (
        <ScreenShell title={title} description="Sign in only when you need account features.">
            <SectionCard title="Sign in to continue">
                <ThemedText>Use your account to manage appointments and finish bookings.</ThemedText>
                <ActionGroup>
                    <ActionLink
                        href={{ pathname: "/sign-in", params: { returnTo: String(returnTo) } } as unknown as Href}
                        label="Sign in"
                    />
                    <ActionLink
                        href={{
                            pathname: "/sign-in",
                            params: { returnTo: String(returnTo), mode: "create-account" },
                        } as unknown as Href}
                        label="Create account"
                        variant="secondary"
                    />
                    <ActionLink href="/" label="Back to discover" variant="secondary" />
                </ActionGroup>
            </SectionCard>
        </ScreenShell>
    );
}
