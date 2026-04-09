import { Link } from "expo-router";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";

import type { PublicCompany } from "@/api/types";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { usePublicCompanies } from "@/features/discovery/queries";
import { useThemeColor } from "@/hooks/use-theme-color";
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

function getCityFilters(companies: PublicCompany[]) {
    const cities = companies
        .map((company) => company.city?.trim())
        .filter((city): city is string => Boolean(city));

    return Array.from(new Set(cities)).sort((left, right) => left.localeCompare(right));
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

function CompanyCard({
    company,
    mutedColor,
    cardBackgroundColor,
    borderColor,
}: {
    company: PublicCompany;
    mutedColor: string;
    cardBackgroundColor: string;
    borderColor: string;
}) {
    const meta = [company.city, company.address].filter(Boolean).join(" · ");
    const distance = formatDistance(company.distanceMeters);

    return (
        <Link href={{ pathname: "/shops/[shopId]", params: { shopId: company.slug } }} asChild>
            <Pressable>
                <ThemedView
                    style={[
                        styles.companyCard,
                        {
                            backgroundColor: cardBackgroundColor,
                            borderColor,
                        },
                    ]}
                >
                    <View style={styles.companyHeader}>
                        <View style={styles.companyHeaderText}>
                            <ThemedText type="defaultSemiBold">{company.name}</ThemedText>
                            {meta ? (
                                <ThemedText style={[styles.metaText, { color: mutedColor }]} numberOfLines={2}>
                                    {meta}
                                </ThemedText>
                            ) : null}
                        </View>
                        {distance ? (
                            <ThemedText style={[styles.distanceText, { color: mutedColor }]}>{distance}</ThemedText>
                        ) : null}
                    </View>
                </ThemedView>
            </Pressable>
        </Link>
    );
}

export function DiscoveryScreen() {
    const [mode, setMode] = useState<DiscoveryMode>("list");
    const [query, setQuery] = useState("");
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [selectedMapCompanyId, setSelectedMapCompanyId] = useState<number | null>(null);
    const deferredQuery = useDeferredValue(query.trim());
    const companiesQuery = usePublicCompanies({
        query: deferredQuery || undefined,
    });

    const textColor = useThemeColor({}, "text");
    const mutedColor = useThemeColor({ light: "#6B7280", dark: "#8E8E93" }, "icon");
    const borderColor = useThemeColor({ light: "rgba(60, 60, 67, 0.18)", dark: "rgba(84, 84, 88, 0.65)" }, "icon");
    const inputBackgroundColor = useThemeColor({ light: "#F2F2F7", dark: "#1C1C1E" }, "background");
    const chipBackgroundColor = useThemeColor({ light: "#F2F2F7", dark: "#1C1C1E" }, "background");
    const cardBackgroundColor = useThemeColor({ light: "#FFFFFF", dark: "#1C1C1E" }, "background");
    const accentColor = useThemeColor({ light: "#0A84FF", dark: "#0A84FF" }, "tint");
    const mapBackgroundColor = useThemeColor({ light: "#E5E7EB", dark: "#111214" }, "background");

    const companies = companiesQuery.data?.results ?? [];
    const cityFilters = getCityFilters(companies);
    const visibleCompanies = selectedCity ? companies.filter((company) => company.city === selectedCity) : companies;
    const mapCompanies = useMemo(() => getMapCompanies(visibleCompanies), [visibleCompanies]);
    const initialRegion = useMemo(() => getInitialRegion(mapCompanies), [mapCompanies]);
    const selectedMapCompany =
        mapCompanies.find((company) => company.id === selectedMapCompanyId) ?? mapCompanies[0] ?? null;

    useEffect(() => {
        if (selectedCity && !cityFilters.includes(selectedCity)) {
            setSelectedCity(null);
        }
    }, [cityFilters, selectedCity]);

    useEffect(() => {
        if (selectedMapCompanyId && !mapCompanies.some((company) => company.id === selectedMapCompanyId)) {
            setSelectedMapCompanyId(mapCompanies[0]?.id ?? null);
        }
    }, [mapCompanies, selectedMapCompanyId]);

    return (
        <ScreenShell title="Discover">
            <View style={styles.stack}>
                <TextInput
                    value={query}
                    onChangeText={(nextValue) => {
                        setQuery(nextValue);
                        setSelectedCity(null);
                    }}
                    placeholder="Search shops"
                    placeholderTextColor={mutedColor}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="search"
                    clearButtonMode="while-editing"
                    style={[
                        styles.searchInput,
                        {
                            color: textColor,
                            backgroundColor: inputBackgroundColor,
                            borderColor,
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
                                    backgroundColor: mode === nextMode ? accentColor : chipBackgroundColor,
                                    borderColor,
                                },
                            ]}
                        >
                            <ThemedText style={[styles.segmentLabel, { color: mode === nextMode ? "#FFFFFF" : textColor }]}>
                                {nextMode === "list" ? "List" : "Map"}
                            </ThemedText>
                        </Pressable>
                    ))}
                </View>

                {cityFilters.length > 0 ? (
                    <View style={styles.chipRow}>
                        <Pressable
                            onPress={() => setSelectedCity(null)}
                            style={[
                                styles.chip,
                                {
                                    backgroundColor: selectedCity == null ? accentColor : chipBackgroundColor,
                                    borderColor,
                                },
                            ]}
                        >
                            <ThemedText style={[styles.chipLabel, { color: selectedCity == null ? "#FFFFFF" : textColor }]}>
                                All
                            </ThemedText>
                        </Pressable>

                        {cityFilters.map((city) => (
                            <Pressable
                                key={city}
                                onPress={() => setSelectedCity(city)}
                                style={[
                                    styles.chip,
                                    {
                                        backgroundColor: selectedCity === city ? accentColor : chipBackgroundColor,
                                        borderColor,
                                    },
                                ]}
                            >
                                <ThemedText style={[styles.chipLabel, { color: selectedCity === city ? "#FFFFFF" : textColor }]}>
                                    {city}
                                </ThemedText>
                            </Pressable>
                        ))}
                    </View>
                ) : null}

                {companiesQuery.isPending ? <ThemedText style={[styles.statusText, { color: mutedColor }]}>Loading shops…</ThemedText> : null}

                {companiesQuery.isError ? <ThemedText style={[styles.statusText, { color: mutedColor }]}>Could not load shops.</ThemedText> : null}

                {!companiesQuery.isPending && !companiesQuery.isError && visibleCompanies.length === 0 ? (
                    <ThemedView
                        style={[
                            styles.emptyCard,
                            {
                                backgroundColor: cardBackgroundColor,
                                borderColor,
                            },
                        ]}
                    >
                        <ThemedText type="defaultSemiBold">No shops found</ThemedText>
                        <ThemedText style={[styles.emptyText, { color: mutedColor }]}>Try a different search.</ThemedText>
                    </ThemedView>
                ) : null}

                {!companiesQuery.isPending && !companiesQuery.isError && visibleCompanies.length > 0 ? (
                    mode === "list" || Platform.OS === "web" ? (
                        <View style={styles.stack}>
                            {visibleCompanies.map((company) => (
                                <CompanyCard
                                    key={company.id}
                                    company={company}
                                    mutedColor={mutedColor}
                                    cardBackgroundColor={cardBackgroundColor}
                                    borderColor={borderColor}
                                />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.stack}>
                            <View style={[styles.mapCard, { backgroundColor: cardBackgroundColor, borderColor }]}>
                                <MapView
                                    initialRegion={initialRegion}
                                    style={[styles.map, { backgroundColor: mapBackgroundColor }]}
                                    onPress={() => setSelectedMapCompanyId(null)}
                                >
                                    {mapCompanies.map((company) => (
                                        <Marker
                                            key={company.id}
                                            coordinate={{ latitude: company.latitude, longitude: company.longitude }}
                                            title={company.name}
                                            description={company.city ?? undefined}
                                            onPress={() => setSelectedMapCompanyId(company.id)}
                                        />
                                    ))}
                                </MapView>
                            </View>

                            {selectedMapCompany ? (
                                <CompanyCard
                                    company={selectedMapCompany}
                                    mutedColor={mutedColor}
                                    cardBackgroundColor={cardBackgroundColor}
                                    borderColor={borderColor}
                                />
                            ) : (
                                <ThemedText style={[styles.statusText, { color: mutedColor }]}>
                                    No mapped shops for this filter.
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
        gap: 12,
    },
    searchInput: {
        minHeight: 52,
        borderRadius: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: StyleSheet.hairlineWidth,
    },
    segmentRow: {
        flexDirection: "row",
        gap: 8,
    },
    segment: {
        flex: 1,
        minHeight: 38,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: StyleSheet.hairlineWidth,
    },
    segmentLabel: {
        fontSize: 15,
        lineHeight: 18,
        fontWeight: "600",
    },
    chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    chip: {
        minHeight: 34,
        borderRadius: 999,
        paddingHorizontal: 12,
        justifyContent: "center",
        borderWidth: StyleSheet.hairlineWidth,
    },
    chipLabel: {
        fontSize: 14,
        lineHeight: 18,
        fontWeight: "600",
    },
    statusText: {
        fontSize: 15,
    },
    emptyCard: {
        borderRadius: 16,
        borderWidth: StyleSheet.hairlineWidth,
        padding: 16,
        gap: 2,
    },
    emptyText: {
        fontSize: 15,
        lineHeight: 20,
    },
    mapCard: {
        overflow: "hidden",
        borderRadius: 18,
        borderWidth: StyleSheet.hairlineWidth,
    },
    map: {
        height: 320,
        width: "100%",
    },
    companyCard: {
        borderRadius: 16,
        borderWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    companyHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        alignItems: "flex-start",
    },
    companyHeaderText: {
        flex: 1,
        gap: 2,
    },
    metaText: {
        fontSize: 14,
        lineHeight: 20,
    },
    distanceText: {
        fontSize: 13,
        lineHeight: 18,
    },
});
