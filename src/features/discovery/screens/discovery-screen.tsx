import { ThemedText } from "@/components/themed-text";
import { usePublicCompanies } from "@/features/discovery/queries";
import { ActionGroup, ActionLink, ScreenShell, SectionCard } from "@/ui/screen-shell";

export function DiscoveryScreen() {
    const companiesQuery = usePublicCompanies();
    const featuredCompany = companiesQuery.data?.results[0] ?? null;

    return (
        <ScreenShell title="Discover">
            <SectionCard title="Explore">
                <ActionGroup>
                    {featuredCompany ? (
                        <ActionLink
                            href={{
                                pathname: "/shops/[shopId]",
                                params: { shopId: featuredCompany.slug },
                            }}
                            label={`Open ${featuredCompany.name}`}
                        />
                    ) : null}
                    <ActionLink href="/sign-in" label="Open sign-in flow" variant="secondary" />
                    <ActionLink href="/appointments" label="Open customer area" variant="secondary" />
                </ActionGroup>
            </SectionCard>

            <SectionCard title="Shops">
                {companiesQuery.isPending ? <ThemedText>Loading shops…</ThemedText> : null}

                {companiesQuery.isError ? (
                    <ThemedText>Could not load shops.</ThemedText>
                ) : null}

                {companiesQuery.data?.results.length ? (
                    <ActionGroup>
                        {companiesQuery.data.results.map((company) => (
                            <ActionLink
                                key={company.id}
                                href={{
                                    pathname: "/shops/[shopId]",
                                    params: { shopId: company.slug },
                                }}
                                label={company.city ? `${company.name} · ${company.city}` : company.name}
                                variant="secondary"
                                trailing={
                                    <ThemedText style={{ color: "#0A7EA4" }}>
                                        {company.distanceMeters != null
                                            ? `${Math.round(company.distanceMeters)} m`
                                            : company.slug}
                                    </ThemedText>
                                }
                            />
                        ))}
                    </ActionGroup>
                ) : null}

                {companiesQuery.data && companiesQuery.data.results.length === 0 ? (
                    <ThemedText>No shops available.</ThemedText>
                ) : null}
            </SectionCard>
        </ScreenShell>
    );
}
