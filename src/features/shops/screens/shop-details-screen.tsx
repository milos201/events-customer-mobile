import { useLocalSearchParams } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { usePublicCompanyBundle } from "@/features/shops/queries";
import { ActionGroup, ActionLink, BackAction, BulletList, ScreenShell, SectionCard } from "@/ui/screen-shell";

export function ShopDetailsScreen() {
    const { shopId } = useLocalSearchParams<{ shopId: string }>();
    const resolvedShopId = shopId ?? "shop";
    const companyQuery = usePublicCompanyBundle(resolvedShopId);
    const company = companyQuery.data?.company;
    const services = companyQuery.data?.services ?? [];
    const employeeNames = company?.employees
        .map((employee) => employee.user?.name ?? employee.userId)
        .filter((value, index, array) => array.indexOf(value) === index);

    return (
        <ScreenShell
            eyebrow="Shop Details"
            title={company?.name ?? `Shop: ${resolvedShopId}`}
            description="This route represents the public shop page: basic profile, services, employees, and the first jump into booking."
        >
            <SectionCard title="Quick navigation">
                <ActionGroup>
                    <BackAction label="Back to discovery" fallbackHref="/" />
                    <ActionLink href={`/booking/${resolvedShopId}`} label="Go to booking" />
                    <ActionLink href="/appointments" label="Open appointments" variant="secondary" />
                </ActionGroup>
            </SectionCard>

            <SectionCard title="Live shop data">
                {companyQuery.isPending ? <ThemedText>Loading shop profile and services…</ThemedText> : null}

                {companyQuery.isError ? (
                    <ThemedText>
                        Could not load the public shop bundle for `{resolvedShopId}`. Confirm the slug exists and that
                        the backend is reachable from the app.
                    </ThemedText>
                ) : null}

                {company ? (
                    <BulletList
                        items={[
                            company.address ?? "Address not set yet",
                            company.city && company.country
                                ? `${company.city}, ${company.country}`
                                : (company.city ?? company.country ?? "City and country not set yet"),
                            company.timezone ?? "Timezone not set yet",
                        ]}
                    />
                ) : null}
            </SectionCard>

            <SectionCard title="Available staff">
                {employeeNames?.length ? (
                    <BulletList items={["Any employee", ...employeeNames]} />
                ) : (
                    <ThemedText>No public employee list is available for this shop yet.</ThemedText>
                )}
            </SectionCard>

            <SectionCard title="Services">
                {services.length ? (
                    <ActionGroup>
                        {services.map((service) => (
                            <ActionLink
                                key={service.id}
                                href={{
                                    pathname: "/booking/[shopId]",
                                    params: { shopId: resolvedShopId },
                                }}
                                label={`${service.name} · ${service.durationMinutes} min`}
                                variant="secondary"
                                trailing={
                                    <ThemedText style={{ color: "#0A7EA4" }}>
                                        {(service.priceCents / 100).toFixed(2)}
                                    </ThemedText>
                                }
                            />
                        ))}
                    </ActionGroup>
                ) : (
                    <ThemedText>No active public services are available yet.</ThemedText>
                )}
            </SectionCard>

            <SectionCard title="Booking handoff">
                <ThemedText>
                    Users should be able to choose a date, employee, and service from here before moving into slot
                    selection and booking confirmation.
                </ThemedText>
                <ActionLink href={`/booking/${resolvedShopId}`} label="Start booking flow" />
            </SectionCard>

            <SectionCard title="Account boundary">
                <ThemedText>
                    Public users can reach this screen without authentication. Only the final booking submission should
                    require sign-in.
                </ThemedText>
                <ActionLink href="/sign-in" label="Open sign-in screen" variant="secondary" />
            </SectionCard>
        </ScreenShell>
    );
}
