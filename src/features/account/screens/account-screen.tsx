import type { Href } from "expo-router";

import { usePathname } from "expo-router";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useAuthSession } from "@/features/auth/session-provider";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Radius, Spacing, Typography } from "@/theme";
import { ActionButton, BulletList, ScreenShell, SectionCard } from "@/ui/screen-shell";

export function AccountScreen() {
    const pathname = usePathname();
    const { signOut, status, user } = useAuthSession();
    const theme = useAppTheme();

    if (status === "loading") {
        return null;
    }

    if (status !== "authenticated") {
        return <AuthGate title="Account" returnTo={String(pathname) as Href} />;
    }

    return (
        <ScreenShell title="Profile" showHero={false} layout="compact">
            <View style={[styles.profileCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
                <View style={[styles.avatar, { backgroundColor: theme.surfaceMuted }]}>
                    <ThemedText style={styles.avatarLabel}>
                        {(user?.name ?? user?.email ?? "Guest")
                            .split(" ")
                            .map((part) => part[0] ?? "")
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                    </ThemedText>
                </View>
                <View style={styles.profileCopy}>
                    <ThemedText type="defaultSemiBold">{user?.name ?? "Customer"}</ThemedText>
                    <ThemedText style={{ color: theme.textMuted }}>{user?.email ?? "No email available"}</ThemedText>
                    <ThemedText style={{ color: theme.textSubtle }}>Manage your bookings and account details.</ThemedText>
                </View>
            </View>

            <SectionCard title="Session">
                <BulletList items={["Signed in", "Bookings, appointments, and saved preferences stay linked to this account."]} />
                <ActionButton
                    label="Sign out"
                    variant="secondary"
                    onPress={() => {
                        void signOut();
                    }}
                />
            </SectionCard>
        </ScreenShell>
    );
}

const styles = StyleSheet.create({
    profileCard: {
        flexDirection: "row",
        gap: Spacing.md,
        padding: Spacing.md,
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
    },
    avatar: {
        width: 58,
        height: 58,
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
});
