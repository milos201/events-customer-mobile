import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { Href } from "expo-router";
import type { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ActionGroup, ActionLink, ScreenShell } from "@/components/ui/screen-shell";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Radius, Shadows, Spacing, Typography } from "@/theme";

type AuthGateProps = {
    title: string;
    returnTo: Href;
};

type AuthGateBenefitProps = {
    icon: ComponentProps<typeof MaterialIcons>["name"];
    title: string;
    subtitle: string;
};

function getAuthHref(returnTo: Href, mode?: "create-account"): Href {
    const params: { returnTo: string; mode?: "create-account" } = { returnTo: String(returnTo) };

    if (mode) {
        params.mode = mode;
    }

    return { pathname: "/sign-in", params };
}

function AuthGateBenefit({ icon, title, subtitle }: AuthGateBenefitProps) {
    const theme = useAppTheme();

    return (
        <View style={styles.benefitRow}>
            <View style={[styles.benefitIcon, { backgroundColor: theme.surfaceMuted }]}>
                <MaterialIcons color={theme.tint} name={icon} size={18} />
            </View>
            <View style={styles.benefitCopy}>
                <ThemedText type="defaultSemiBold" style={styles.benefitTitle}>
                    {title}
                </ThemedText>
                <ThemedText style={[styles.benefitSubtitle, { color: theme.textMuted }]}>{subtitle}</ThemedText>
            </View>
        </View>
    );
}

export function AuthGate({ title, returnTo }: AuthGateProps) {
    const theme = useAppTheme();

    return (
        <ScreenShell title={title} layout="compact" bottomPadding="xl" contentGap="lg">
            <View
                style={[
                    styles.heroCard,
                    Shadows.floating,
                    { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                ]}
            >
                <View style={[styles.avatar, { backgroundColor: theme.tintMuted }]}>
                    <MaterialIcons color={theme.tint} name="person-outline" size={30} />
                </View>
                <View style={styles.heroCopy}>
                    <ThemedText type="subtitle" style={styles.heroTitle}>
                        Keep your bookings in one place
                    </ThemedText>
                    <ThemedText style={[styles.heroText, { color: theme.textMuted }]}>
                        Sign in to manage upcoming visits, book again faster, and keep your preferences ready.
                    </ThemedText>
                </View>
            </View>

            <View
                style={[
                    styles.benefitsCard,
                    Shadows.card,
                    { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                ]}
            >
                <AuthGateBenefit
                    icon="event-available"
                    title="Upcoming visits"
                    subtitle="See appointment status, times, and shop details."
                />
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <AuthGateBenefit
                    icon="history"
                    title="Booking history"
                    subtitle="Rebook previous services without starting from scratch."
                />
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <AuthGateBenefit
                    icon="notifications-none"
                    title="Account preferences"
                    subtitle="Keep reminders and profile details tied to your account."
                />
            </View>

            <ActionGroup>
                <ActionLink href={getAuthHref(returnTo)} label="Sign in" />
                <ActionLink href={getAuthHref(returnTo, "create-account")} label="Create account" variant="secondary" />
            </ActionGroup>
        </ScreenShell>
    );
}

const styles = StyleSheet.create({
    heroCard: {
        borderRadius: Radius.xl,
        borderWidth: StyleSheet.hairlineWidth,
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    avatar: {
        width: 68,
        height: 68,
        borderRadius: Radius.full,
        alignItems: "center",
        justifyContent: "center",
    },
    heroCopy: {
        gap: Spacing.xs,
    },
    heroTitle: {
        lineHeight: 30,
    },
    heroText: {
        ...Typography.body,
    },
    benefitsCard: {
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        overflow: "hidden",
    },
    benefitRow: {
        flexDirection: "row",
        gap: Spacing.md,
        padding: Spacing.md,
        alignItems: "center",
    },
    benefitIcon: {
        width: 40,
        height: 40,
        borderRadius: Radius.full,
        alignItems: "center",
        justifyContent: "center",
    },
    benefitCopy: {
        flex: 1,
        gap: 2,
    },
    benefitTitle: {
        fontSize: 17,
        lineHeight: 22,
    },
    benefitSubtitle: {
        ...Typography.bodySm,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        marginLeft: Spacing.md + 40 + Spacing.md,
    },
});
