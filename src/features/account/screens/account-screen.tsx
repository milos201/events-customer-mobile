import { ThemedText } from "@/components/themed-text";
import { useAuthSession } from "@/features/auth/session-provider";
import { ActionButton, ActionGroup, ActionLink, BackAction, BulletList, ScreenShell, SectionCard } from "@/ui/screen-shell";

export function AccountScreen() {
    const { signOut, user } = useAuthSession();

    return (
        <ScreenShell title="Account">
            <SectionCard title="Actions">
                <ActionGroup>
                    <ActionLink href="/appointments" label="Open appointments tab" />
                    <BackAction label="Back to discovery" fallbackHref="/" />
                </ActionGroup>
            </SectionCard>

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
