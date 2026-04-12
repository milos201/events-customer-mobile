import { Link, useRouter } from "expo-router";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";

import type { PublicCompany } from "@/api/types";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ScreenShell } from "@/components/ui/screen-shell";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { usePublicCompanies } from "@/features/discovery/queries";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Radius, Shadows, Spacing, Typography } from "@/theme";

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

function getInitialRegion(companies: (PublicCompany & { latitude: number; longitude: number })[]): Region {
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
    const address = [company.address, company.city].filter(Boolean).join(", ") || "Location details coming soon";
    const distance = formatDistance(company.distanceMeters);

    return (
        <Link href={{ pathname: "/shops/[shopId]", params: { shopId: company.slug } }} asChild>
            <Pressable style={({ pressed }) => (pressed ? styles.companyCardPressed : null)}>
                <View
                    style={[
                        styles.companyCard,
                        Shadows.card,
                        { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                    ]}
                >
                    <View style={styles.companyTopRow}>
                        <View style={styles.companyCopy}>
                            <ThemedText type="defaultSemiBold" style={styles.companyName} numberOfLines={1}>
                                {company.name}
                            </ThemedText>
                            <View style={styles.addressRow}>
                                <IconSymbol color={theme.textSubtle} name="mappin.and.ellipse" size={16} />
                                <ThemedText style={[styles.addressText, { color: theme.textMuted }]} numberOfLines={1}>
                                    {address}
                                </ThemedText>
                            </View>
                        </View>
                        <View style={styles.cardAside}>
                            <View style={[styles.statusPill, { backgroundColor: theme.successSurface }]}>
                                <ThemedText style={[styles.statusPillText, { color: theme.success }]}>Open</ThemedText>
                            </View>
                            {distance ? (
                                <ThemedText style={[styles.distanceText, { color: theme.textMuted }]}>
                                    {distance}
                                </ThemedText>
                            ) : null}
                        </View>
                    </View>
                </View>
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
            layout="detail"
        >
            <View style={styles.stack}>
                <View
                    style={[
                        styles.searchShell,
                        Shadows.card,
                        { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                    ]}
                >
                    <IconSymbol color={theme.textSubtle} name="magnifyingglass" size={20} />
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
                            },
                        ]}
                    />
                </View>

                <SegmentedControl
                    value={mode}
                    onChange={setMode}
                    size="lg"
                    shadowed
                    options={[
                        { value: "list", label: "List" },
                        { value: "map", label: "Map" },
                    ]}
                />

                {companiesQuery.isPending ? (
                    <ThemedText style={[styles.statusText, { color: theme.textMuted }]}>Loading shops…</ThemedText>
                ) : null}

                {companiesQuery.isError ? (
                    <ThemedText style={[styles.statusText, { color: theme.textMuted }]}>
                        Could not load shops.
                    </ThemedText>
                ) : null}

                {!companiesQuery.isPending && !companiesQuery.isError && visibleCompanies.length === 0 ? (
                    <View
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
                    </View>
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
    searchShell: {
        minHeight: 56,
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: Spacing.md,
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        minHeight: 54,
        paddingVertical: 0,
        fontSize: 16,
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
        height: 420,
        width: "100%",
    },
    companyCard: {
        minHeight: 96,
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
    },
    companyCardPressed: {
        opacity: 0.78,
    },
    companyTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: Spacing.sm,
        alignItems: "flex-start",
    },
    companyCopy: {
        flex: 1,
        gap: 6,
    },
    companyName: {
        fontSize: 20,
        lineHeight: 24,
    },
    addressRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs,
    },
    addressText: {
        ...Typography.bodySm,
        flex: 1,
    },
    cardAside: {
        alignItems: "flex-end",
        gap: Spacing.xs,
    },
    statusPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: Radius.full,
    },
    statusPillText: {
        ...Typography.label,
        fontWeight: "700",
    },
    distanceText: {
        ...Typography.label,
    },
});
