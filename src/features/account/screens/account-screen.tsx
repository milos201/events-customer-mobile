import type { Href } from "expo-router";

import { usePathname } from "expo-router";
import { useAuthSession } from "@/features/auth/session-provider";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { ActionButton, BulletList, ScreenShell, SectionCard } from "@/ui/screen-shell";

export function AccountScreen() {
    const pathname = usePathname();
    const { signOut, status, user } = useAuthSession();

    if (status === "loading") {
        return null;
    }

    if (status !== "authenticated") {
        return <AuthGate title="Account" returnTo={String(pathname) as Href} />;
    }

    return (
        <ScreenShell title="Account" showHero={false}>
            <SectionCard title="Session">
                <BulletList items={[user?.name ?? "Unknown customer", user?.email ?? "No email available"]} />
                <ActionButton
                    label="Sign out"
                    variant="secondary"
                    onPress={() => {
                        void signOut();
                    }}
                />
            </SectionCard>
        </ScreenShell>
    );
}
