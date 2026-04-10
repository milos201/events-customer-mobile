import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { usePublicCompanyBundle } from "@/features/shops/queries";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Radius, Shadows, Spacing, Typography } from "@/theme";
import { BulletList, ScreenShell, SectionCard } from "@/ui/screen-shell";

type ShopTab = "services" | "barbers" | "about";

export function ShopDetailsScreen() {
    const router = useRouter();
    const { shopId } = useLocalSearchParams<{ shopId: string }>();
    const resolvedShopId = shopId ?? "shop";
    const companyQuery = usePublicCompanyBundle(resolvedShopId);
    const theme = useAppTheme();
    const [activeTab, setActiveTab] = useState<ShopTab>("services");
    const company = companyQuery.data?.company;
    const services = companyQuery.data?.services ?? [];
    const employeeNames = company?.employees
        .map((employee) => employee.user?.name ?? employee.userId)
        .filter((value, index, array) => array.indexOf(value) === index);

    return (
        <View style={styles.screen}>
            <ScreenShell
                title={null}
                includeTopInset={false}
            >
                {company ? (
                    <View style={[styles.heroCard, Shadows.floating, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
                        <View style={styles.heroTopRow}>
                            <View style={styles.heroCopy}>
                                <ThemedText type="defaultSemiBold" style={styles.heroTitle}>
                                    {company.name}
                                </ThemedText>
                                <View style={styles.addressRow}>
                                    <IconSymbol color={theme.textSubtle} name="mappin.and.ellipse" size={16} />
                                    <ThemedText style={[styles.addressText, { color: theme.textMuted }]}>
                                        {[company.address, company.city].filter(Boolean).join(", ") || "Location details coming soon"}
                                    </ThemedText>
                                </View>
                            </View>
                            <View style={[styles.statusPill, { backgroundColor: theme.successSurface }]}>
                                <ThemedText style={[styles.statusPillText, { color: theme.success }]}>Open</ThemedText>
                            </View>
                        </View>
                        <View style={[styles.metaDivider, { backgroundColor: theme.border }]} />
                        <View style={styles.metaRow}>
                            <ThemedText style={{ color: theme.textMuted }}>Timezone</ThemedText>
                            <ThemedText type="defaultSemiBold">{company.timezone ?? "Not set yet"}</ThemedText>
                        </View>
                    </View>
                ) : null}

                <View style={[styles.tabRow, Shadows.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    {([
                        { key: "services", label: "Services" },
                        { key: "barbers", label: "Barbers" },
                        { key: "about", label: "About" },
                    ] as const).map((tab) => (
                        <Pressable
                            key={tab.key}
                            onPress={() => setActiveTab(tab.key)}
                            style={[
                                styles.tabButton,
                                activeTab === tab.key
                                    ? [styles.tabButtonActive, Shadows.card, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]
                                    : styles.tabButtonIdle,
                            ]}
                        >
                            <ThemedText
                                style={[
                                    styles.tabButtonText,
                                    { color: activeTab === tab.key ? theme.text : theme.textMuted },
                                ]}
                            >
                                {tab.label}
                            </ThemedText>
                        </Pressable>
                    ))}
                </View>

            {activeTab === "about" ? (
                <View style={styles.aboutStack}>
                    {companyQuery.isPending ? <ThemedText>Loading shop profile and services…</ThemedText> : null}

                    {companyQuery.isError ? (
                        <ThemedText>Could not load shop details.</ThemedText>
                    ) : null}

                    {company ? (
                        <>
                            <View style={styles.aboutSection}>
                                <ThemedText style={[styles.aboutLabel, { color: theme.textSubtle }]}>Location</ThemedText>
                                <View style={styles.aboutRow}>
                                    <IconSymbol color={theme.tint} name="mappin.and.ellipse" size={16} />
                                    <ThemedText style={styles.aboutValue}>
                                        {company.address ?? "Address not set yet"}
                                    </ThemedText>
                                </View>
                                <ThemedText style={[styles.aboutSupport, { color: theme.textMuted }]}>
                                    {company.city && company.country
                                        ? `${company.city}, ${company.country}`
                                        : (company.city ?? company.country ?? "City and country not set yet")}
                                </ThemedText>
                            </View>

                            <View style={[styles.aboutDivider, { backgroundColor: theme.border }]} />

                            <View style={styles.aboutSection}>
                                <ThemedText style={[styles.aboutLabel, { color: theme.textSubtle }]}>Timezone</ThemedText>
                                <ThemedText style={styles.aboutValue}>{company.timezone ?? "Timezone not set yet"}</ThemedText>
                            </View>
                        </>
                    ) : null}
                </View>
            ) : null}

            {activeTab === "barbers" ? (
                <View style={styles.barbersStack}>
                    {employeeNames?.length ? (
                        <>
                            <View
                                style={[
                                    styles.barberCard,
                                    Shadows.card,
                                    { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                                ]}
                            >
                                <View style={styles.barberAvatar}>
                                    <IconSymbol color={theme.tint} name="person.fill" size={18} />
                                </View>
                                <View style={styles.barberCopy}>
                                    <ThemedText type="defaultSemiBold">Any available barber</ThemedText>
                                    <ThemedText style={[styles.barberMeta, { color: theme.textMuted }]}>
                                        First available team member
                                    </ThemedText>
                                </View>
                            </View>

                            {employeeNames.map((employeeName) => (
                                <View
                                    key={employeeName}
                                    style={[
                                        styles.barberCard,
                                        Shadows.card,
                                        { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                                    ]}
                                >
                                    <View style={[styles.barberAvatar, { backgroundColor: theme.surfaceMuted }]}>
                                        <ThemedText style={styles.barberInitials}>
                                            {employeeName
                                                .split(" ")
                                                .map((part) => part[0] ?? "")
                                                .join("")
                                                .slice(0, 2)
                                                .toUpperCase()}
                                        </ThemedText>
                                    </View>
                                    <View style={styles.barberCopy}>
                                        <ThemedText type="defaultSemiBold">{employeeName}</ThemedText>
                                        <ThemedText style={[styles.barberMeta, { color: theme.textMuted }]}>
                                            Available for booking
                                        </ThemedText>
                                    </View>
                                </View>
                            ))}
                        </>
                    ) : (
                        <ThemedText>No staff available.</ThemedText>
                    )}
                </View>
            ) : null}

                {activeTab === "services" ? (
                    <View style={styles.servicesStack}>
                        {services.length ? (
                            <>
                                {services.map((service) => (
                                    <Pressable
                                        key={service.id}
                                        onPress={() => {
                                            router.push({
                                                pathname: "/booking/[shopId]",
                                                params: { shopId: resolvedShopId, serviceId: String(service.id) },
                                            });
                                        }}
                                        style={[
                                            styles.serviceCard,
                                            Shadows.card,
                                            { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                                        ]}
                                    >
                                        <View style={styles.serviceCopy}>
                                            <ThemedText type="defaultSemiBold" style={styles.serviceTitle}>
                                                {service.name}
                                            </ThemedText>
                                            <ThemedText style={[styles.serviceMeta, { color: theme.textMuted }]}>
                                                {service.durationMinutes} min
                                            </ThemedText>
                                        </View>
                                        <ThemedText style={[styles.servicePrice, { color: theme.text }]}>
                                            ${(service.priceCents / 100).toFixed(0)}
                                        </ThemedText>
                                    </Pressable>
                                ))}
                            </>
                        ) : (
                            <ThemedText>No services available.</ThemedText>
                        )}
                    </View>
                ) : null}

                <View style={styles.bottomSpacer} />
            </ScreenShell>

            <View
                pointerEvents="box-none"
                style={[
                    styles.ctaWrap,
                    {
                        backgroundColor: theme.backgroundCanvas,
                    },
                ]}
            >
                <Pressable
                    onPress={() => {
                        router.push({
                            pathname: "/booking/[shopId]",
                            params: { shopId: resolvedShopId },
                        });
                    }}
                    style={[
                        styles.ctaButton,
                        Shadows.floating,
                        { backgroundColor: theme.tint },
                    ]}
                >
                    <ThemedText style={[styles.ctaLabel, { color: theme.tintForeground }]}>Book Appointment</ThemedText>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    heroCard: {
        borderRadius: Radius.xl,
        borderWidth: StyleSheet.hairlineWidth,
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    heroTopRow: {
        flexDirection: "row",
        gap: Spacing.md,
        alignItems: "flex-start",
    },
    heroCopy: {
        flex: 1,
        gap: 4,
    },
    addressRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs,
    },
    addressText: {
        flex: 1,
    },
    heroTitle: {
        fontSize: 30,
        lineHeight: 34,
    },
    statusPill: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: Radius.full,
    },
    statusPillText: {
        ...Typography.label,
    },
    metaDivider: {
        height: StyleSheet.hairlineWidth,
    },
    metaRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: Spacing.md,
    },
    tabRow: {
        flexDirection: "row",
        gap: Spacing.xs,
        borderRadius: Radius.xl,
        borderWidth: StyleSheet.hairlineWidth,
        padding: 6,
    },
    tabButton: {
        flex: 1,
        minHeight: 52,
        borderRadius: Radius.lg,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: Spacing.md,
    },
    tabButtonActive: {
        borderWidth: StyleSheet.hairlineWidth,
    },
    tabButtonIdle: {
        backgroundColor: "transparent",
    },
    tabButtonText: {
        fontSize: 16,
        lineHeight: 20,
        fontWeight: "600",
    },
    servicesStack: {
        gap: Spacing.md,
        width: "100%",
    },
    aboutStack: {
        gap: Spacing.md,
        width: "100%",
        paddingHorizontal: Spacing.xs,
    },
    aboutSection: {
        gap: Spacing.xs,
    },
    aboutLabel: {
        ...Typography.label,
    },
    aboutRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs,
    },
    aboutValue: {
        ...Typography.body,
        fontWeight: "600",
        flex: 1,
    },
    aboutSupport: {
        ...Typography.bodySm,
        paddingLeft: 24,
    },
    aboutDivider: {
        height: StyleSheet.hairlineWidth,
    },
    barbersStack: {
        gap: Spacing.md,
        width: "100%",
    },
    barberCard: {
        width: "100%",
        minHeight: 84,
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: Spacing.md,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
    },
    barberAvatar: {
        width: 44,
        height: 44,
        borderRadius: Radius.full,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F3E7DA",
    },
    barberInitials: {
        ...Typography.label,
        fontWeight: "700",
    },
    barberCopy: {
        flex: 1,
        gap: 2,
    },
    barberMeta: {
        ...Typography.bodySm,
    },
    serviceCard: {
        width: "100%",
        minHeight: 88,
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: Spacing.md,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: Spacing.sm,
    },
    serviceCopy: {
        flex: 1,
        gap: 2,
    },
    serviceTitle: {
        ...Typography.body,
    },
    serviceMeta: {
        ...Typography.bodySm,
    },
    servicePrice: {
        fontSize: 20,
        lineHeight: 24,
        fontWeight: "700",
        textAlign: "right",
    },
    bottomSpacer: {
        height: 76,
    },
    ctaWrap: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    ctaButton: {
        minHeight: 56,
        borderRadius: Radius.lg,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: Spacing.lg,
    },
    ctaLabel: {
        fontSize: 16,
        lineHeight: 20,
        fontWeight: "700",
    },
});
