import { useLocalSearchParams } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ActionGroup, ActionLink, BackAction, BulletList, ScreenShell, SectionCard } from "@/src/ui/screen-shell";

export function BookingScreen() {
    const { shopId } = useLocalSearchParams<{ shopId: string }>();
    const resolvedShopId = shopId ?? "shop";

    return (
        <ScreenShell
            eyebrow="Booking"
            title="Request an appointment"
            description={`The booking flow for ${resolvedShopId} should resolve service, employee or any employee, date, valid start time, and pending appointment creation.`}
        >
            <SectionCard title="Quick navigation">
                <ActionGroup>
                    <BackAction label="Back to shop" fallbackHref={`/shops/${resolvedShopId}`} />
                    <ActionLink href="/sign-in" label="Go to sign-in" />
                    <ActionLink href="/appointments" label="Open appointments" variant="secondary" />
                </ActionGroup>
            </SectionCard>

            <SectionCard title="Required selections">
                <BulletList
                    items={[
                        "One shop, one service, one date, one start time.",
                        "Either a specific employee or any employee.",
                        "Derived end time based on service duration.",
                    ]}
                />
            </SectionCard>

            <SectionCard title="State transitions">
                <BulletList
                    items={[
                        "Unauthenticated users should be redirected to sign-in before confirming.",
                        "Successful requests create a pending appointment.",
                        "Customers should later see the result in appointments.",
                    ]}
                />
                <ActionLink href="/sign-in" label="Continue to sign-in" />
            </SectionCard>

            <SectionCard title="Next integration step">
                <ThemedText>
                    This screen is the first place to plug in generated OpenAPI types, form validation, and slot
                    availability fetching.
                </ThemedText>
            </SectionCard>
        </ScreenShell>
    );
}
