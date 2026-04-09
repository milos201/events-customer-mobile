import { useMemo } from "react";

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

export function AppointmentsScreen() {
    const { user } = useAuthSession();
    const appointmentsQuery = useOwnAppointments();
    const cancelAppointment = useCancelOwnAppointment();
    const appointments = appointmentsQuery.data?.results ?? [];
    const cancellableIds = useMemo(
        () => new Set(appointments.filter(canCancelAppointment).map((appointment) => appointment.id)),
        [appointments],
    );

    return (
        <ScreenShell
            eyebrow="Customer Area"
            title="Appointments"
            description="This tab will show the customer’s upcoming and past bookings, along with the current appointment status defined in the backend stories."
        >
            <SectionCard title="Quick navigation">
                <ActionGroup>
                    <BackAction label="Back to discovery" fallbackHref="/" />
                    <ActionLink href="/shops/barber-house" label="View sample shop" variant="secondary" />
                    <ActionLink href="/account" label="Open account tab" />
                </ActionGroup>
            </SectionCard>

            <SectionCard title="Core responsibilities">
                <BulletList
                    items={[
                        "List pending, confirmed, rejected, cancelled, completed, and no-show appointments.",
                        "Show enough detail for a customer to understand the booking outcome.",
                        "Allow cancellation of eligible upcoming appointments.",
                    ]}
                />
            </SectionCard>

            <SectionCard title="Your appointments">
                {appointmentsQuery.isPending ? <ThemedText>Loading appointments…</ThemedText> : null}

                {appointmentsQuery.isError ? (
                    <ThemedText>
                        Could not load appointments for {user?.email ?? "the current customer"}. Confirm the backend
                        session is valid and `/v1/users/me/appointments` is reachable.
                    </ThemedText>
                ) : null}

                {appointmentsQuery.data && appointments.length === 0 ? (
                    <ThemedText>No appointments yet. The first booking you create should appear here.</ThemedText>
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
                                            void cancelAppointment.mutateAsync(appointment.id);
                                        }}
                                    />
                                ) : null}
                            </SectionCard>
                        ))}
                    </ActionGroup>
                ) : null}
            </SectionCard>

            <SectionCard title="Flow coverage">
                <ThemedText>
                    This screen closes the MVP loop after discovery, shop details, booking, and sign-in.
                </ThemedText>
                <ThemedText>Signed in as {user?.name ?? "customer"}.</ThemedText>
                <ActionLink href="/" label="Back to discovery" variant="secondary" />
            </SectionCard>
        </ScreenShell>
    );
}
