import { ThemedText } from "@/components/themed-text";
import { ActionGroup, ActionLink, BackAction, BulletList, ScreenShell, SectionCard } from "@/ui/screen-shell";

export function AppointmentsScreen() {
    return (
        <ScreenShell
            eyebrow="Customer Area"
            title="Appointments"
            description="This tab will show the customer’s upcoming and past bookings, along with the current appointment status defined in the backend stories."
        >
            <SectionCard title="Quick navigation">
                <ActionGroup>
                    <BackAction label="Back to discovery" fallbackHref="/" />
                    <ActionLink href="/shops/barber-house" label="View sample shop" variant="secondary" />
                    <ActionLink href="/account" label="Open account tab" />
                </ActionGroup>
            </SectionCard>

            <SectionCard title="Core responsibilities">
                <BulletList
                    items={[
                        "List pending, confirmed, rejected, cancelled, completed, and no-show appointments.",
                        "Show enough detail for a customer to understand the booking outcome.",
                        "Allow cancellation of eligible upcoming appointments.",
                    ]}
                />
            </SectionCard>

            <SectionCard title="Flow coverage">
                <ThemedText>
                    This screen closes the MVP loop after discovery, shop details, booking, and sign-in.
                </ThemedText>
                <ActionLink href="/" label="Back to discovery" variant="secondary" />
            </SectionCard>
        </ScreenShell>
    );
}
