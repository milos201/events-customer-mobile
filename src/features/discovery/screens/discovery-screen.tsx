import { ThemedText } from "@/components/themed-text";
import { usePublicCompanies } from "@/features/discovery/queries";
import { apiBaseUrl } from "@/lib/config";
import { ActionGroup, ActionLink, BulletList, ScreenShell, SectionCard } from "@/ui/screen-shell";

export function DiscoveryScreen() {
    const companiesQuery = usePublicCompanies();

    return (
        <ScreenShell
            eyebrow="Public Discovery"
            title="Find a barber nearby"
            description="This is the MVP entry point from the user stories: open the app, browse approved shops on a map, and jump into a shop page before signing in."
        >
            <SectionCard title="Navigate the skeleton">
                <ActionGroup>
                    <ActionLink href="/shops/barber-house" label="Browse sample shop" />
                    <ActionLink href="/sign-in" label="Open sign-in flow" variant="secondary" />
                    <ActionLink href="/appointments" label="Open customer area" variant="secondary" />
                </ActionGroup>
            </SectionCard>

            <SectionCard title="Live public companies">
                {companiesQuery.isPending ? <ThemedText>Loading approved shops from {apiBaseUrl}…</ThemedText> : null}

                {companiesQuery.isError ? (
                    <ThemedText>
                        Could not load companies. Confirm `EXPO_PUBLIC_API_URL` points at the running backend and that
                        the API allows requests from the Expo client.
                    </ThemedText>
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
                    <ThemedText>No approved companies are visible yet.</ThemedText>
                ) : null}
            </SectionCard>

            <SectionCard title="What belongs here next">
                <BulletList
                    items={[
                        "Map view and marker clustering.",
                        "Search, filters, and a nearby results list.",
                        "Loading, empty, and location-denied states.",
                    ]}
                />
            </SectionCard>

            <SectionCard title="Product note">
                <ThemedText>
                    Build this screen directly from the discovery stories in `../events-api/USER_STORIES.md` before
                    wiring richer UI polish.
                </ThemedText>
            </SectionCard>
        </ScreenShell>
    );
}
