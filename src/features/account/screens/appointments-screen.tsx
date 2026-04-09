import { useMemo } from "react";

import { ApiError, ApiUnauthorizedError } from "@/api/http";
import type { AppointmentRecord } from "@/api/types";
import { ThemedText } from "@/components/themed-text";
import { useCancelOwnAppointment, useOwnAppointments } from "@/features/account/queries";
import { useAuthSession } from "@/features/auth/session-provider";
import { ActionButton, ActionGroup, ActionLink, BackAction, BulletList, ScreenShell, SectionCard } from "@/ui/screen-shell";

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
    const { user } = useAuthSession();
    const appointmentsQuery = useOwnAppointments();
    const cancelAppointment = useCancelOwnAppointment();
    const appointments = appointmentsQuery.data?.results ?? [];
    const cancellableIds = useMemo(
        () => new Set(appointments.filter(canCancelAppointment).map((appointment) => appointment.id)),
        [appointments],
    );
    const recentCompany = appointments[0]?.company ?? null;
    const cancellationMessage =
        cancelAppointment.isSuccess && cancelAppointment.data
            ? `Appointment at ${cancelAppointment.data.company?.name ?? "the shop"} cancelled.`
            : null;

    return (
        <ScreenShell title="Appointments">
            <SectionCard title="Actions">
                <ActionGroup>
                    <BackAction label="Back to discovery" fallbackHref="/" />
                    {recentCompany ? (
                        <ActionLink
                            href={{
                                pathname: "/shops/[shopId]",
                                params: { shopId: recentCompany.slug },
                            }}
                            label={`Open ${recentCompany.name}`}
                            variant="secondary"
                        />
                    ) : null}
                    <ActionLink href="/account" label="Open account tab" />
                </ActionGroup>
            </SectionCard>

            <SectionCard title="Your appointments">
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

                {appointments.length ? (
                    <ActionGroup>
                        {appointments.map((appointment) => (
                            <SectionCard
                                key={appointment.id}
                                title={`${appointment.company?.name ?? "Company"} · ${appointment.serviceNameSnapshot}`}
                            >
                                <BulletList
                                    items={[
                                        `Status: ${appointment.status}`,
                                        `When: ${formatDateRange(appointment)}`,
                                        `Employee: ${appointment.employee?.name ?? "Assigned by shop"}`,
                                        `Price: ${(appointment.servicePriceCentsSnapshot / 100).toFixed(2)}`,
                                    ]}
                                />
                                {appointment.notesCustomer ? (
                                    <ThemedText>Notes: {appointment.notesCustomer}</ThemedText>
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
                                            cancelAppointment.reset();
                                            void cancelAppointment.mutateAsync(appointment.id);
                                        }}
                                    />
                                ) : null}
                            </SectionCard>
                        ))}
                    </ActionGroup>
                ) : null}
            </SectionCard>
        </ScreenShell>
    );
}
