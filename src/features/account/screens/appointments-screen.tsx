import type { Href } from "expo-router";
import { usePathname, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import { ApiError, ApiUnauthorizedError } from "@/api/http";
import type { AppointmentRecord } from "@/api/types";
import { ThemedText } from "@/components/themed-text";
import { SegmentedControl, SegmentedControlCountBadge } from "@/components/ui/segmented-control";
import {
    canCancelAppointment,
    formatAppointmentDateLabel,
    isUpcomingAppointment,
} from "@/features/account/appointment-utils";
import { useCancelOwnAppointment, useOwnAppointments } from "@/features/account/queries";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { useAuthSession } from "@/features/auth/session-provider";
import { useAppTheme } from "@/hooks/use-app-theme";
import { formatTimeLabel } from "@/lib/formatters";
import { Fonts, Radius, Shadows, Spacing, Typography } from "@/theme";
import { ScreenShell } from "@/ui/screen-shell";

type AppointmentsTab = "upcoming" | "past";

function formatStatusLabel(status: AppointmentRecord["status"]) {
    switch (status) {
        case "noShow":
            return "No-show";
        default:
            return status.charAt(0).toUpperCase() + status.slice(1);
    }
}

function getUserFacingErrorMessage(error: unknown, fallback: string) {
    if (error instanceof ApiUnauthorizedError) {
        return error.message;
    }

    if (error instanceof ApiError && error.status === 409) {
        return "This appointment can no longer be updated.";
    }

    if (error instanceof ApiError && error.body && typeof error.body === "object" && "message" in error.body) {
        const message = (error.body as { message?: unknown }).message;
        if (typeof message === "string" && message.length > 0) {
            return message;
        }
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
}

function getStatusTone(status: AppointmentRecord["status"], theme: ReturnType<typeof useAppTheme>) {
    switch (status) {
        case "confirmed":
            return {
                backgroundColor: theme.successSurface,
                color: theme.success,
            };
        case "pending":
            return {
                backgroundColor: theme.warningSurface,
                color: theme.warning,
            };
        case "completed":
            return {
                backgroundColor: theme.tintMuted,
                color: theme.tint,
            };
        case "cancelled":
        case "rejected":
        case "noShow":
            return {
                backgroundColor: theme.surfaceMuted,
                color: theme.textMuted,
            };
        default:
            return {
                backgroundColor: theme.surfaceMuted,
                color: theme.textMuted,
            };
    }
}

function AppointmentCard({
    appointment,
    onOpenShop,
    onBookAgain,
    onCancel,
    isCancelling,
}: {
    appointment: AppointmentRecord;
    onOpenShop: () => void;
    onBookAgain: () => void;
    onCancel?: () => void;
    isCancelling: boolean;
}) {
    const theme = useAppTheme();
    const statusTone = getStatusTone(appointment.status, theme);

    return (
        <View
            style={[styles.card, Shadows.card, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
        >
            <View style={styles.cardHeader}>
                <View style={styles.cardHeaderCopy}>
                    <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                        {appointment.company?.name ?? "Shop"}
                    </ThemedText>
                    <ThemedText style={[styles.cardSubtitle, { color: theme.textMuted }]}>
                        {appointment.serviceNameSnapshot}
                    </ThemedText>
                </View>
                <View style={[styles.statusChip, { backgroundColor: statusTone.backgroundColor }]}>
                    <ThemedText style={[styles.statusChipText, { color: statusTone.color }]}>
                        {formatStatusLabel(appointment.status)}
                    </ThemedText>
                </View>
            </View>

            <View style={styles.infoStack}>
                <View style={styles.infoRow}>
                    <ThemedText style={[styles.infoLabel, { color: theme.textMuted }]}>Service</ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.infoValue}>
                        {appointment.serviceNameSnapshot}
                    </ThemedText>
                </View>
                <View style={styles.infoRow}>
                    <ThemedText style={[styles.infoLabel, { color: theme.textMuted }]}>Barber</ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.infoValue}>
                        {appointment.employee?.name ?? "Assigned by shop"}
                    </ThemedText>
                </View>
                <View style={styles.infoRow}>
                    <ThemedText style={[styles.infoLabel, { color: theme.textMuted }]}>Date & Time</ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.infoValue}>
                        {formatAppointmentDateLabel(appointment.startsAt)} • {formatTimeLabel(appointment.startsAt)}
                    </ThemedText>
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.actionsRow}>
                <Pressable
                    onPress={onOpenShop}
                    style={[styles.actionChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
                >
                    <ThemedText style={[styles.actionChipText, { color: theme.text }]}>Open shop</ThemedText>
                </Pressable>

                <Pressable
                    onPress={onBookAgain}
                    style={[styles.actionChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
                >
                    <ThemedText style={[styles.actionChipText, { color: theme.text }]}>Book again</ThemedText>
                </Pressable>

                {onCancel ? (
                    <Pressable
                        onPress={onCancel}
                        style={[styles.actionChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    >
                        <ThemedText style={[styles.actionChipText, { color: theme.danger }]}>
                            {isCancelling ? "Cancelling…" : "Cancel"}
                        </ThemedText>
                    </Pressable>
                ) : null}
            </View>
        </View>
    );
}

export function AppointmentsScreen() {
    const router = useRouter();
    const pathname = usePathname();
    const theme = useAppTheme();
    const { status, user } = useAuthSession();
    const appointmentsQuery = useOwnAppointments(status === "authenticated");
    const cancelAppointment = useCancelOwnAppointment();
    const [activeTab, setActiveTab] = useState<AppointmentsTab>("upcoming");
    const appointmentResults = appointmentsQuery.data?.results;
    const appointments = useMemo(() => appointmentResults ?? [], [appointmentResults]);

    const upcomingAppointments = useMemo(() => appointments.filter(isUpcomingAppointment), [appointments]);
    const pastAppointments = useMemo(
        () => appointments.filter((appointment) => !isUpcomingAppointment(appointment)),
        [appointments],
    );

    const activeAppointments = activeTab === "upcoming" ? upcomingAppointments : pastAppointments;
    const cancellationMessage =
        cancelAppointment.isSuccess && cancelAppointment.data
            ? `Appointment at ${cancelAppointment.data.company?.name ?? "the shop"} cancelled.`
            : null;

    if (status === "loading") {
        return null;
    }

    if (status !== "authenticated") {
        return <AuthGate title="Appointments" returnTo={String(pathname) as Href} />;
    }

    return (
        <ScreenShell title="My Bookings" description="Manage your appointments" layout="compact">
            <SegmentedControl
                value={activeTab}
                onChange={setActiveTab}
                variant="surface"
                size="lg"
                shadowed
                options={[
                    {
                        value: "upcoming",
                        label: "Upcoming",
                        badge: <SegmentedControlCountBadge count={upcomingAppointments.length} />,
                    },
                    { value: "past", label: "Past" },
                ]}
            />

            {appointmentsQuery.isPending ? (
                <ThemedText style={{ color: theme.textMuted }}>Loading appointments…</ThemedText>
            ) : null}

            {appointmentsQuery.isError ? (
                <ThemedText style={{ color: theme.textMuted }}>
                    {getUserFacingErrorMessage(
                        appointmentsQuery.error,
                        `Could not load appointments for ${user?.email ?? "the current customer"}.`,
                    )}
                </ThemedText>
            ) : null}

            {cancellationMessage ? (
                <ThemedText style={{ color: theme.success }}>{cancellationMessage}</ThemedText>
            ) : null}

            {cancelAppointment.isError ? (
                <ThemedText style={{ color: theme.danger }}>
                    {getUserFacingErrorMessage(cancelAppointment.error, "Could not cancel appointment.")}
                </ThemedText>
            ) : null}

            {!appointmentsQuery.isPending && !appointmentsQuery.isError && appointments.length === 0 ? (
                <ThemedText style={{ color: theme.textMuted }}>No bookings yet.</ThemedText>
            ) : null}

            {!appointmentsQuery.isPending &&
            !appointmentsQuery.isError &&
            appointments.length > 0 &&
            activeAppointments.length === 0 ? (
                <ThemedText style={{ color: theme.textMuted }}>
                    {activeTab === "upcoming" ? "No upcoming bookings." : "No past bookings."}
                </ThemedText>
            ) : null}

            {activeAppointments.length ? (
                <View style={styles.cardsStack}>
                    {activeAppointments.map((appointment) => (
                        <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            isCancelling={cancelAppointment.isPending && cancelAppointment.variables === appointment.id}
                            onOpenShop={() => {
                                if (!appointment.company) {
                                    return;
                                }

                                router.push({
                                    pathname: "/shops/[shopId]",
                                    params: { shopId: appointment.company.slug },
                                });
                            }}
                            onBookAgain={() => {
                                if (!appointment.company) {
                                    return;
                                }

                                router.push({
                                    pathname: "/booking/[shopId]",
                                    params: {
                                        shopId: appointment.company.slug,
                                        serviceId: String(appointment.serviceId),
                                    },
                                });
                            }}
                            onCancel={
                                canCancelAppointment(appointment)
                                    ? () => {
                                          Alert.alert(
                                              "Cancel appointment?",
                                              "This will release the slot if the shop still accepts changes.",
                                              [
                                                  {
                                                      text: "Keep appointment",
                                                      style: "cancel",
                                                  },
                                                  {
                                                      text: "Cancel appointment",
                                                      style: "destructive",
                                                      onPress: () => {
                                                          cancelAppointment.reset();
                                                          void cancelAppointment.mutateAsync(appointment.id);
                                                      },
                                                  },
                                              ],
                                          );
                                      }
                                    : undefined
                            }
                        />
                    ))}
                </View>
            ) : null}
        </ScreenShell>
    );
}

const styles = StyleSheet.create({
    cardsStack: {
        gap: Spacing.md,
    },
    card: {
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        padding: Spacing.md,
        gap: Spacing.md,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: Spacing.md,
    },
    cardHeaderCopy: {
        flex: 1,
        gap: 2,
    },
    cardTitle: {
        fontFamily: Fonts.sans,
    },
    cardSubtitle: {
        ...Typography.bodySm,
        fontFamily: Fonts.sans,
    },
    statusChip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: Radius.full,
    },
    statusChipText: {
        ...Typography.label,
        fontFamily: Fonts.sans,
    },
    infoStack: {
        gap: Spacing.xs,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: Spacing.md,
    },
    infoLabel: {
        ...Typography.bodySm,
        fontFamily: Fonts.sans,
    },
    infoValue: {
        flexShrink: 1,
        textAlign: "right",
        fontFamily: Fonts.sans,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
    },
    actionsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: Spacing.xs,
    },
    actionChip: {
        minHeight: 38,
        borderRadius: Radius.full,
        borderWidth: StyleSheet.hairlineWidth,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 14,
    },
    actionChipText: {
        ...Typography.label,
        fontFamily: Fonts.sans,
    },
});
