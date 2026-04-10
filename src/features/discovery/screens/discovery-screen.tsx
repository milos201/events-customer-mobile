import { Link, useRouter } from "expo-router";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";

import type { PublicCompany } from "@/api/types";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { usePublicCompanies } from "@/features/discovery/queries";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Radius, Shadows, Spacing, Typography } from "@/theme";
import { ScreenShell } from "@/ui/screen-shell";

type DiscoveryMode = "list" | "map";

function formatDistance(distanceMeters?: number) {
    if (distanceMeters == null) {
        return null;
    }

    if (distanceMeters >= 1000) {
        return `${(distanceMeters / 1000).toFixed(1)} km`;
    }

    return `${Math.round(distanceMeters)} m`;
}

function getMapCompanies(companies: PublicCompany[]) {
    return companies.filter(
        (company): company is PublicCompany & { latitude: number; longitude: number } =>
            typeof company.latitude === "number" && typeof company.longitude === "number",
    );
}

function getInitialRegion(companies: Array<PublicCompany & { latitude: number; longitude: number }>): Region {
    if (companies.length === 0) {
        return {
            latitude: 44.8176,
            longitude: 20.4633,
            latitudeDelta: 0.12,
            longitudeDelta: 0.12,
        };
    }

    if (companies.length === 1) {
        return {
            latitude: companies[0].latitude,
            longitude: companies[0].longitude,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
        };
    }

    const latitudes = companies.map((company) => company.latitude);
    const longitudes = companies.map((company) => company.longitude);
    const minLatitude = Math.min(...latitudes);
    const maxLatitude = Math.max(...latitudes);
    const minLongitude = Math.min(...longitudes);
    const maxLongitude = Math.max(...longitudes);

    return {
        latitude: (minLatitude + maxLatitude) / 2,
        longitude: (minLongitude + maxLongitude) / 2,
        latitudeDelta: Math.max((maxLatitude - minLatitude) * 1.6, 0.04),
        longitudeDelta: Math.max((maxLongitude - minLongitude) * 1.6, 0.04),
    };
}

function isCompanyInRegion(company: PublicCompany & { latitude: number; longitude: number }, region: Region) {
    const latitudeMin = region.latitude - region.latitudeDelta / 2;
    const latitudeMax = region.latitude + region.latitudeDelta / 2;
    const longitudeMin = region.longitude - region.longitudeDelta / 2;
    const longitudeMax = region.longitude + region.longitudeDelta / 2;

    return (
        company.latitude >= latitudeMin &&
        company.latitude <= latitudeMax &&
        company.longitude >= longitudeMin &&
        company.longitude <= longitudeMax
    );
}

function CompanyCard({ company, theme }: { company: PublicCompany; theme: ReturnType<typeof useAppTheme> }) {
    const meta = [company.city, company.address].filter(Boolean).join(" · ");
    const distance = formatDistance(company.distanceMeters);

    return (
        <Link href={{ pathname: "/shops/[shopId]", params: { shopId: company.slug } }} asChild>
            <Pressable>
                <ThemedView
                    style={[
                        styles.companyCard,
                        Shadows.card,
                        { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                    ]}
                >
                    <View style={styles.companyHeader}>
                        <View style={styles.companyHeaderText}>
                            <ThemedText type="defaultSemiBold">{company.name}</ThemedText>
                            {meta ? (
                                <ThemedText style={[styles.metaText, { color: theme.textMuted }]} numberOfLines={2}>
                                    {meta}
                                </ThemedText>
                            ) : null}
                        </View>
                        <View style={styles.cardAside}>
                            {distance ? (
                                <ThemedText style={[styles.distanceText, { color: theme.textMuted }]}>
                                    {distance}
                                </ThemedText>
                            ) : null}
                            <ThemedText style={[styles.arrow, { color: theme.textSubtle }]}>›</ThemedText>
                        </View>
                    </View>
                </ThemedView>
            </Pressable>
        </Link>
    );
}

export function DiscoveryScreen() {
    const router = useRouter();
    const theme = useAppTheme();
    const [mode, setMode] = useState<DiscoveryMode>("list");
    const [query, setQuery] = useState("");
    const deferredQuery = useDeferredValue(query.trim());
    const companiesQuery = usePublicCompanies({
        query: deferredQuery || undefined,
    });

    const companies = companiesQuery.data?.results ?? [];
    const visibleCompanies = companies;
    const mapCompanies = useMemo(() => getMapCompanies(visibleCompanies), [visibleCompanies]);
    const initialRegion = useMemo(() => getInitialRegion(mapCompanies), [mapCompanies]);
    const [mapRegion, setMapRegion] = useState<Region>(initialRegion);
    const visibleMapCompanies = useMemo(
        () => mapCompanies.filter((company) => isCompanyInRegion(company, mapRegion)),
        [mapCompanies, mapRegion],
    );

    useEffect(() => {
        setMapRegion(initialRegion);
    }, [initialRegion]);

    return (
        <ScreenShell
            eyebrow="Current location"
            title={
                <View style={styles.locationTitleRow}>
                    <IconSymbol color={theme.tint} name="mappin.and.ellipse" size={24} />
                    <ThemedText type="title" style={styles.locationTitle}>
                        Nis, RS
                    </ThemedText>
                </View>
            }
        >
            <View style={styles.stack}>
                <TextInput
                    value={query}
                    onChangeText={(nextValue) => {
                        setQuery(nextValue);
                    }}
                    placeholder="Search shops"
                    placeholderTextColor={theme.textSubtle}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="search"
                    clearButtonMode="while-editing"
                    style={[
                        styles.searchInput,
                        {
                            color: theme.text,
                            backgroundColor: theme.surface,
                            borderColor: theme.border,
                        },
                    ]}
                />

                <View style={styles.segmentRow}>
                    {(["list", "map"] as const).map((nextMode) => (
                        <Pressable
                            key={nextMode}
                            onPress={() => setMode(nextMode)}
                            style={[
                                styles.segment,
                                {
                                    backgroundColor: mode === nextMode ? theme.tint : theme.surface,
                                    borderColor: mode === nextMode ? theme.tint : theme.border,
                                },
                            ]}
                        >
                            <ThemedText
                                style={[
                                    styles.segmentLabel,
                                    { color: mode === nextMode ? theme.tintForeground : theme.text },
                                ]}
                            >
                                {nextMode === "list" ? "List" : "Map"}
                            </ThemedText>
                        </Pressable>
                    ))}
                </View>

                {companiesQuery.isPending ? (
                    <ThemedText style={[styles.statusText, { color: theme.textMuted }]}>Loading shops…</ThemedText>
                ) : null}

                {companiesQuery.isError ? (
                    <ThemedText style={[styles.statusText, { color: theme.textMuted }]}>
                        Could not load shops.
                    </ThemedText>
                ) : null}

                {!companiesQuery.isPending && !companiesQuery.isError && visibleCompanies.length === 0 ? (
                    <ThemedView
                        style={[
                            styles.emptyCard,
                            Shadows.card,
                            { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                        ]}
                    >
                        <ThemedText type="defaultSemiBold">No shops found</ThemedText>
                        <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>
                            Try a different search.
                        </ThemedText>
                    </ThemedView>
                ) : null}

                {!companiesQuery.isPending && !companiesQuery.isError && visibleCompanies.length > 0 ? (
                    mode === "list" || Platform.OS === "web" ? (
                        <View style={styles.stack}>
                            {visibleCompanies.map((company) => (
                                <CompanyCard key={company.id} company={company} theme={theme} />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.stack}>
                            <View
                                style={[
                                    styles.mapCard,
                                    Shadows.card,
                                    { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                                ]}
                            >
                                <MapView
                                    initialRegion={initialRegion}
                                    style={[styles.map, { backgroundColor: theme.surfaceMuted }]}
                                    onRegionChangeComplete={setMapRegion}
                                >
                                    {mapCompanies.map((company) => (
                                        <Marker
                                            key={company.id}
                                            coordinate={{ latitude: company.latitude, longitude: company.longitude }}
                                            title={company.name}
                                            description={company.city ?? undefined}
                                            onPress={() => {
                                                router.push({
                                                    pathname: "/shops/[shopId]",
                                                    params: { shopId: company.slug },
                                                });
                                            }}
                                        />
                                    ))}
                                </MapView>
                            </View>

                            {visibleMapCompanies.length > 0 ? (
                                <View style={styles.stack}>
                                    {visibleMapCompanies.map((company) => (
                                        <CompanyCard key={company.id} company={company} theme={theme} />
                                    ))}
                                </View>
                            ) : (
                                <ThemedText style={[styles.statusText, { color: theme.textMuted }]}>
                                    No shops are currently visible in this map area.
                                </ThemedText>
                            )}
                        </View>
                    )
                ) : null}
            </View>
        </ScreenShell>
    );
}

const styles = StyleSheet.create({
    stack: {
        gap: Spacing.md,
    },
    locationTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs,
    },
    locationTitle: {
        lineHeight: 40,
    },
    searchInput: {
        minHeight: 52,
        borderRadius: Radius.md,
        paddingHorizontal: Spacing.md,
        fontSize: 16,
        borderWidth: StyleSheet.hairlineWidth,
    },
    segmentRow: {
        flexDirection: "row",
        gap: Spacing.xs,
    },
    segment: {
        flex: 1,
        minHeight: 42,
        borderRadius: Radius.md,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: StyleSheet.hairlineWidth,
    },
    segmentLabel: {
        fontSize: 15,
        lineHeight: 18,
        fontWeight: "600",
    },
    statusText: {
        ...Typography.bodySm,
    },
    emptyCard: {
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        padding: Spacing.md,
        gap: 2,
    },
    emptyText: {
        ...Typography.bodySm,
    },
    mapCard: {
        overflow: "hidden",
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
    },
    map: {
        height: 440,
        width: "100%",
    },
    companyCard: {
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: Spacing.md,
        paddingVertical: 14,
    },
    companyHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: Spacing.sm,
        alignItems: "flex-start",
    },
    companyHeaderText: {
        flex: 1,
        gap: 2,
    },
    cardAside: {
        alignItems: "flex-end",
        gap: 2,
    },
    metaText: {
        ...Typography.bodySm,
    },
    distanceText: {
        ...Typography.label,
    },
    arrow: {
        fontSize: 24,
        lineHeight: 24,
    },
});
