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
        <ScreenShell title={company?.name ?? "Shop"}>
            <SectionCard title="Actions">
                <ActionGroup>
                    <BackAction label="Back to discovery" fallbackHref="/" />
                    <ActionLink href={`/booking/${resolvedShopId}`} label="Go to booking" />
                    <ActionLink href="/appointments" label="Open appointments" variant="secondary" />
                </ActionGroup>
            </SectionCard>

            <SectionCard title="Details">
                {companyQuery.isPending ? <ThemedText>Loading shop profile and services…</ThemedText> : null}

                {companyQuery.isError ? (
                    <ThemedText>Could not load shop details.</ThemedText>
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
                    <ThemedText>No staff available.</ThemedText>
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
                                    params: { shopId: resolvedShopId, serviceId: String(service.id) },
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
                    <ThemedText>No services available.</ThemedText>
                )}
            </SectionCard>
        </ScreenShell>
    );
}
