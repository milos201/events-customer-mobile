import type { Href } from "expo-router";

import { ActionGroup, ActionLink, ScreenShell, SectionCard } from "@/ui/screen-shell";

type AuthGateProps = {
    title: string;
    returnTo: Href;
};

export function AuthGate({ title, returnTo }: AuthGateProps) {
    return (
        <ScreenShell title={title}>
            <SectionCard title="Sign in to continue">
                <ActionGroup>
                    <ActionLink
                        href={{ pathname: "/sign-in", params: { returnTo: String(returnTo) } } as unknown as Href}
                        label="Sign in"
                    />
                    <ActionLink href="/" label="Back to discover" variant="secondary" />
                </ActionGroup>
            </SectionCard>
        </ScreenShell>
    );
}
