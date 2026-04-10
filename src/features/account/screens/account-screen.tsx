import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Constants from "expo-constants";
import type { Href } from "expo-router";
import { usePathname } from "expo-router";
import type { ComponentProps, ReactNode } from "react";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Switch, View } from "react-native";

import type { AppointmentRecord } from "@/api/types";
import { ThemedText } from "@/components/themed-text";
import { useOwnAppointments } from "@/features/account/queries";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { useAuthSession } from "@/features/auth/session-provider";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Radius, Shadows, Spacing, Typography } from "@/theme";
import { ScreenShell } from "@/ui/screen-shell";

type ProfileActionTone = "default" | "danger";

type ProfileActionRowProps = {
    icon: ComponentProps<typeof MaterialIcons>["name"];
    title: string;
    subtitle: string;
    onPress?: () => void;
    tone?: ProfileActionTone;
    trailing?: ReactNode;
};

function getInitials(value: string) {
    return value
        .split(" ")
        .map((part) => part[0] ?? "")
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function getCreatedAt(value: unknown) {
    if (!value || typeof value !== "object") {
        return null;
    }

    const candidate = (value as { createdAt?: unknown }).createdAt;
    return typeof candidate === "string" ? candidate : null;
}

function formatMemberSince(value: string | null) {
    if (!value) {
        return "Customer account";
    }

    return `Member since ${new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
    }).format(new Date(value))}`;
}

function isUpcomingAppointment(appointment: AppointmentRecord) {
    if (appointment.status !== "pending" && appointment.status !== "confirmed") {
        return false;
    }

    return new Date(appointment.startsAt).getTime() > Date.now();
}

function StatCard({ value, label }: { value: string; label: string }) {
    const theme = useAppTheme();

    return (
        <View
            style={[
                styles.statCard,
                Shadows.card,
                { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
            ]}
        >
            <ThemedText style={styles.statValue}>{value}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textMuted }]}>{label}</ThemedText>
        </View>
    );
}

function ProfileSection({ title, children }: { title: string; children: ReactNode }) {
    const theme = useAppTheme();

    return (
        <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: theme.textSubtle }]}>{title}</ThemedText>
            <View
                style={[
                    styles.sectionCard,
                    Shadows.card,
                    { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                ]}
            >
                {children}
            </View>
        </View>
    );
}

function ProfileActionRow({ icon, title, subtitle, onPress, tone = "default", trailing }: ProfileActionRowProps) {
    const theme = useAppTheme();
    const rowTitleColor = tone === "danger" ? theme.danger : theme.text;
    const rowSubtitleColor = tone === "danger" ? theme.danger : theme.textMuted;
    const iconColor = tone === "danger" ? theme.danger : theme.icon;
    const content = (
        <View style={styles.rowContent}>
            <View style={[styles.rowLeadingIcon, { backgroundColor: theme.surfaceMuted }]}>
                <MaterialIcons color={iconColor} name={icon} size={18} />
            </View>
            <View style={styles.rowCopy}>
                <ThemedText type="defaultSemiBold" style={[styles.rowTitle, { color: rowTitleColor }]}>
                    {title}
                </ThemedText>
                <ThemedText style={[styles.rowSubtitle, { color: rowSubtitleColor }]}>{subtitle}</ThemedText>
            </View>
            {trailing ?? (onPress ? <MaterialIcons color={theme.textSubtle} name="chevron-right" size={20} /> : null)}
        </View>
    );

    if (onPress) {
        return (
            <Pressable style={styles.row} onPress={onPress}>
                {content}
            </Pressable>
        );
    }

    return <View style={styles.row}>{content}</View>;
}

function SectionDivider() {
    const theme = useAppTheme();
    return <View style={[styles.sectionDivider, { backgroundColor: theme.border }]} />;
}

export function AccountScreen() {
    const pathname = usePathname();
    const theme = useAppTheme();
    const { signOut, status, user, session } = useAuthSession();
    const appointmentsQuery = useOwnAppointments(status === "authenticated");
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const displayName = user?.name?.trim() || "Customer";
    const displayEmail = user?.email ?? "No email available";
    const memberSince = formatMemberSince(getCreatedAt(user) ?? getCreatedAt(session));
    const appointmentResults = appointmentsQuery.data?.results;
    const appointments = useMemo(() => appointmentResults ?? [], [appointmentResults]);
    const versionLabel = Constants.expoConfig?.version ?? "1.0.0";

    const { totalBookings, upcomingVisits } = useMemo(() => {
        return {
            totalBookings: appointments.length,
            upcomingVisits: appointments.filter(isUpcomingAppointment).length,
        };
    }, [appointments]);

    if (status === "loading") {
        return null;
    }

    if (status !== "authenticated") {
        return <AuthGate title="Profile" returnTo={String(pathname) as Href} />;
    }

    return (
        <ScreenShell title="Profile" layout="compact" bottomPadding="xl" contentGap="lg">
            <View
                style={[
                    styles.profileCard,
                    Shadows.card,
                    { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                ]}
            >
                <View style={[styles.avatar, { backgroundColor: theme.surfaceMuted }]}>
                    <ThemedText style={styles.avatarLabel}>
                        {getInitials(user?.name ?? user?.email ?? "Guest")}
                    </ThemedText>
                </View>
                <View style={styles.profileCopy}>
                    <ThemedText type="defaultSemiBold" style={styles.profileName}>
                        {displayName}
                    </ThemedText>
                    <ThemedText style={[styles.profileMeta, { color: theme.textMuted }]}>{displayEmail}</ThemedText>
                    <ThemedText style={[styles.profileMeta, { color: theme.textSubtle }]}>{memberSince}</ThemedText>
                </View>
            </View>

            <View style={styles.statsRow}>
                <StatCard
                    value={appointmentsQuery.isPending || appointmentsQuery.isError ? "—" : String(totalBookings)}
                    label="Total Bookings"
                />
                <StatCard
                    value={appointmentsQuery.isPending || appointmentsQuery.isError ? "—" : String(upcomingVisits)}
                    label="Upcoming Visits"
                />
            </View>

            {appointmentsQuery.isError ? (
                <ThemedText style={[styles.statusText, { color: theme.textMuted }]}>
                    Could not load booking stats.
                </ThemedText>
            ) : null}

            <ProfileSection title="Preferences">
                <ProfileActionRow
                    icon="notifications-none"
                    title="Notifications"
                    subtitle="Booking updates and reminders"
                    trailing={
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ false: theme.surfaceMuted, true: theme.tintMuted }}
                            thumbColor={notificationsEnabled ? theme.tint : theme.surfaceElevated}
                            ios_backgroundColor={theme.surfaceMuted}
                        />
                    }
                />
                <SectionDivider />
                <ProfileActionRow icon="palette" title="Appearance" subtitle="Follows your device setting" />
            </ProfileSection>

            <ProfileSection title="Support">
                <ProfileActionRow
                    icon="logout"
                    title="Sign Out"
                    subtitle="End your current session"
                    tone="danger"
                    onPress={() => {
                        void signOut();
                    }}
                />
            </ProfileSection>

            <ThemedText style={[styles.versionText, { color: theme.textSubtle }]}>Clippr v{versionLabel}</ThemedText>
        </ScreenShell>
    );
}

const styles = StyleSheet.create({
    profileCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.md,
        padding: Spacing.md,
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: Radius.full,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarLabel: {
        ...Typography.body,
        fontWeight: "700",
    },
    profileCopy: {
        flex: 1,
        gap: 2,
    },
    profileName: {
        fontSize: 20,
        lineHeight: 26,
    },
    profileMeta: {
        ...Typography.bodySm,
    },
    statsRow: {
        flexDirection: "row",
        gap: Spacing.md,
    },
    statCard: {
        flex: 1,
        minHeight: 120,
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.xs,
        paddingHorizontal: Spacing.sm,
    },
    statValue: {
        fontSize: 32,
        lineHeight: 36,
        fontWeight: "700",
    },
    statLabel: {
        ...Typography.bodySm,
        textAlign: "center",
    },
    statusText: {
        ...Typography.bodySm,
    },
    section: {
        gap: Spacing.sm,
    },
    sectionTitle: {
        ...Typography.sectionEyebrow,
    },
    sectionCard: {
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        overflow: "hidden",
    },
    row: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
    },
    rowContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.md,
    },
    rowLeadingIcon: {
        width: 36,
        height: 36,
        borderRadius: Radius.full,
        alignItems: "center",
        justifyContent: "center",
    },
    rowCopy: {
        flex: 1,
        gap: 2,
    },
    rowTitle: {
        fontSize: 18,
        lineHeight: 24,
    },
    rowSubtitle: {
        ...Typography.bodySm,
    },
    sectionDivider: {
        height: StyleSheet.hairlineWidth,
        marginLeft: Spacing.md + 36 + Spacing.md,
    },
    versionText: {
        ...Typography.bodySm,
        textAlign: "center",
    },
});
