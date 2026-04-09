import { ActionGroup, ActionLink, BackAction, BulletList, ScreenShell, SectionCard } from "@/ui/screen-shell";

export function AccountScreen() {
    return (
        <ScreenShell
            eyebrow="Customer Area"
            title="Account"
            description="Keep account scope narrow at first: session state, profile basics, notification preferences, and links back into the booking journey."
        >
            <SectionCard title="Quick navigation">
                <ActionGroup>
                    <ActionLink href="/appointments" label="Open appointments tab" />
                    <BackAction label="Back to discovery" fallbackHref="/" />
                    <ActionLink href="/sign-in" label="Open sign-in" variant="secondary" />
                </ActionGroup>
            </SectionCard>

            <SectionCard title="MVP scope">
                <BulletList
                    items={[
                        "Profile basics tied to the authenticated customer account.",
                        "Push notification registration state.",
                        "Session management and sign-out.",
                    ]}
                />
            </SectionCard>
        </ScreenShell>
    );
}
