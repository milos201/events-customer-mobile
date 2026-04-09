import type { Href } from "expo-router";
import { usePathname } from "expo-router";
import { useMemo } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { ApiError, ApiUnauthorizedError } from "@/api/http";
import type { AppointmentRecord } from "@/api/types";
import { ThemedText } from "@/components/themed-text";
import { useCancelOwnAppointment, useOwnAppointments } from "@/features/account/queries";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { useAuthSession } from "@/features/auth/session-provider";
import { ActionButton, ActionGroup, ActionLink, BulletList, ScreenShell, SectionCard } from "@/ui/screen-shell";

function formatDateRange(appointment: AppointmentRecord) {
    const startsAt = new Date(appointment.startsAt);
    const endsAt = new Date(appointment.endsAt);

    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(startsAt).concat(" - ").concat(
        new Intl.DateTimeFormat("en-US", {
            timeStyle: "short",
        }).format(endsAt),
    );
}

function canCancelAppointment(appointment: AppointmentRecord) {
    const startsAt = new Date(appointment.startsAt);
    return (appointment.status === "pending" || appointment.status === "confirmed") && startsAt.getTime() > Date.now();
}

function isUpcomingAppointment(appointment: AppointmentRecord) {
    return canCancelAppointment(appointment);
}

function getStatusTone(status: AppointmentRecord["status"]) {
    switch (status) {
        case "confirmed":
            return {
                backgroundColor: "rgba(34, 197, 94, 0.14)",
                color: "#166534",
            };
        case "pending":
            return {
                backgroundColor: "rgba(245, 158, 11, 0.16)",
                color: "#92400E",
            };
        case "completed":
            return {
                backgroundColor: "rgba(10, 126, 164, 0.14)",
                color: "#0A7EA4",
            };
        case "cancelled":
        case "rejected":
        case "noShow":
            return {
                backgroundColor: "rgba(107, 114, 128, 0.18)",
                color: "#4B5563",
            };
        default:
            return {
                backgroundColor: "rgba(107, 114, 128, 0.18)",
                color: "#4B5563",
            };
    }
}

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

export function AppointmentsScreen() {
    const pathname = usePathname();
    const { status, user } = useAuthSession();
    const appointmentsQuery = useOwnAppointments(status === "authenticated");
    const cancelAppointment = useCancelOwnAppointment();
    const appointments = appointmentsQuery.data?.results ?? [];
    const upcomingAppointments = useMemo(
        () => appointments.filter(isUpcomingAppointment),
        [appointments],
    );
    const historyAppointments = useMemo(
        () => appointments.filter((appointment) => !isUpcomingAppointment(appointment)),
        [appointments],
    );
    const cancellableIds = useMemo(
        () => new Set(appointments.filter(canCancelAppointment).map((appointment) => appointment.id)),
        [appointments],
    );
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
        <ScreenShell
            title="Appointments"
            description="Review upcoming bookings, reopen the shop, or book the same service again."
            showHero={false}
        >
            <SectionCard title="Upcoming">
                {appointmentsQuery.isPending ? <ThemedText>Loading appointments…</ThemedText> : null}

                {appointmentsQuery.isError ? (
                    <ThemedText>
                        {getUserFacingErrorMessage(
                            appointmentsQuery.error,
                            `Could not load appointments for ${user?.email ?? "the current customer"}.`,
                        )}
                    </ThemedText>
                ) : null}

                {appointmentsQuery.data && appointments.length === 0 ? (
                    <ThemedText>No appointments yet.</ThemedText>
                ) : null}

                {cancellationMessage ? <ThemedText>{cancellationMessage}</ThemedText> : null}

                {cancelAppointment.isError ? (
                    <ThemedText>{getUserFacingErrorMessage(cancelAppointment.error, "Could not cancel appointment.")}</ThemedText>
                ) : null}

                {upcomingAppointments.length ? (
                    <ActionGroup>
                        {upcomingAppointments.map((appointment) => (
                            <SectionCard
                                key={appointment.id}
                                title={`${appointment.company?.name ?? "Company"} · ${appointment.serviceNameSnapshot}`}
                            >
                                <View style={styles.metaRow}>
                                    <View
                                        style={[
                                            styles.statusChip,
                                            { backgroundColor: getStatusTone(appointment.status).backgroundColor },
                                        ]}
                                    >
                                        <ThemedText style={[styles.statusChipText, { color: getStatusTone(appointment.status).color }]}>
                                            {formatStatusLabel(appointment.status)}
                                        </ThemedText>
                                    </View>
                                </View>
                                <BulletList
                                    items={[
                                        `When: ${formatDateRange(appointment)}`,
                                        `Employee: ${appointment.employee?.name ?? "Assigned by shop"}`,
                                        `Price: ${(appointment.servicePriceCentsSnapshot / 100).toFixed(2)}`,
                                    ]}
                                />
                                {appointment.notesCustomer ? (
                                    <ThemedText>Notes: {appointment.notesCustomer}</ThemedText>
                                ) : null}
                                <ActionGroup>
                                    {appointment.company ? (
                                        <ActionLink
                                            href={{
                                                pathname: "/shops/[shopId]",
                                                params: { shopId: appointment.company.slug },
                                            }}
                                            label="Open shop"
                                            variant="secondary"
                                        />
                                    ) : null}
                                    {appointment.company ? (
                                        <ActionLink
                                            href={{
                                                pathname: "/booking/[shopId]",
                                                params: {
                                                    shopId: appointment.company.slug,
                                                    serviceId: String(appointment.serviceId),
                                                },
                                            }}
                                            label="Book again"
                                        />
                                    ) : null}
                                    {cancellableIds.has(appointment.id) ? (
                                        <ActionButton
                                            label={
                                                cancelAppointment.isPending && cancelAppointment.variables === appointment.id
                                                    ? "Cancelling…"
                                                    : "Cancel appointment"
                                            }
                                            variant="secondary"
                                            onPress={() => {
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
                                            }}
                                        />
                                    ) : null}
                                </ActionGroup>
                            </SectionCard>
                        ))}
                    </ActionGroup>
                ) : appointmentsQuery.data && appointments.length > 0 ? (
                    <ThemedText>No upcoming appointments.</ThemedText>
                ) : null}
            </SectionCard>

            <SectionCard title="History">
                {historyAppointments.length ? (
                    <ActionGroup>
                        {historyAppointments.map((appointment) => (
                            <SectionCard
                                key={appointment.id}
                                title={`${appointment.company?.name ?? "Company"} · ${appointment.serviceNameSnapshot}`}
                            >
                                <View style={styles.metaRow}>
                                    <View
                                        style={[
                                            styles.statusChip,
                                            { backgroundColor: getStatusTone(appointment.status).backgroundColor },
                                        ]}
                                    >
                                        <ThemedText style={[styles.statusChipText, { color: getStatusTone(appointment.status).color }]}>
                                            {formatStatusLabel(appointment.status)}
                                        </ThemedText>
                                    </View>
                                </View>
                                <BulletList
                                    items={[
                                        `When: ${formatDateRange(appointment)}`,
                                        `Employee: ${appointment.employee?.name ?? "Assigned by shop"}`,
                                        `Price: ${(appointment.servicePriceCentsSnapshot / 100).toFixed(2)}`,
                                    ]}
                                />
                                <ActionGroup>
                                    {appointment.company ? (
                                        <ActionLink
                                            href={{
                                                pathname: "/shops/[shopId]",
                                                params: { shopId: appointment.company.slug },
                                            }}
                                            label="Open shop"
                                            variant="secondary"
                                        />
                                    ) : null}
                                    {appointment.company ? (
                                        <ActionLink
                                            href={{
                                                pathname: "/booking/[shopId]",
                                                params: {
                                                    shopId: appointment.company.slug,
                                                    serviceId: String(appointment.serviceId),
                                                },
                                            }}
                                            label="Book again"
                                        />
                                    ) : null}
                                </ActionGroup>
                            </SectionCard>
                        ))}
                    </ActionGroup>
                ) : appointmentsQuery.data && appointments.length > 0 ? (
                    <ThemedText>No past appointments yet.</ThemedText>
                ) : null}
            </SectionCard>
        </ScreenShell>
    );
}

const styles = StyleSheet.create({
    metaRow: {
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    statusChip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
    },
    statusChipText: {
        fontSize: 13,
        fontWeight: "600",
    },
});
