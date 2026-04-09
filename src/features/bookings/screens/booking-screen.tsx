import { useMemo, useState } from "react";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { StyleSheet, TextInput, View } from "react-native";

import { ApiError } from "@/api/http";
import type { Service } from "@/api/types";
import { ThemedText } from "@/components/themed-text";
import { useAuthSession } from "@/features/auth/session-provider";
import { useCreateAppointment, useBookingAvailability } from "@/features/bookings/queries";
import { usePublicCompanyBundle } from "@/features/shops/queries";
import { ActionButton, ActionGroup, ActionLink, BackAction, BulletList, ScreenShell, SectionCard } from "@/ui/screen-shell";

function toLocalDateInputValue(date: Date) {
    return date.toISOString().slice(0, 10);
}

function getApiErrorMessage(error: unknown) {
    if (error instanceof ApiError && error.body && typeof error.body === "object" && "message" in error.body) {
        const message = (error.body as { message?: unknown }).message;
        if (typeof message === "string" && message.length > 0) {
            return message;
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Something went wrong while processing the booking.";
}

function formatStartTimeLabel(value: string) {
    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export function BookingScreen() {
    const router = useRouter();
    const pathname = usePathname();
    const { status } = useAuthSession();
    const { shopId, serviceId } = useLocalSearchParams<{ shopId: string; serviceId?: string }>();
    const resolvedShopId = shopId ?? "shop";
    const companyQuery = usePublicCompanyBundle(resolvedShopId);
    const company = companyQuery.data?.company;
    const services = companyQuery.data?.services ?? [];
    const employees = company?.employees ?? [];

    const initialService = useMemo(() => {
        if (!serviceId) {
            return services[0]?.id ?? null;
        }

        const parsed = Number(serviceId);
        return Number.isFinite(parsed) ? parsed : (services[0]?.id ?? null);
    }, [serviceId, services]);

    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
    const [employeeMode, setEmployeeMode] = useState<"any" | "specific">("any");
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(toLocalDateInputValue(new Date()));
    const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
    const [notesCustomer, setNotesCustomer] = useState("");

    const resolvedServiceId = selectedServiceId ?? initialService;
    const selectedService = services.find((service) => service.id === resolvedServiceId) ?? null;
    const availabilityInput =
        company && selectedService && selectedDate
            ? employeeMode === "any"
                ? {
                      companyId: company.id,
                      serviceId: selectedService.id,
                      date: selectedDate,
                      assignAnyEmployee: true as const,
                  }
                : selectedEmployeeId
                  ? {
                        companyId: company.id,
                        serviceId: selectedService.id,
                        date: selectedDate,
                        employeeId: selectedEmployeeId,
                    }
                  : null
            : null;
    const availabilityQuery = useBookingAvailability(availabilityInput);
    const createAppointment = useCreateAppointment();

    const availableTimes = availabilityQuery.data?.startTimes ?? [];

    const returnTo = resolvedServiceId ? `${pathname}?serviceId=${resolvedServiceId}` : pathname;

    return (
        <ScreenShell
            eyebrow="Booking"
            title="Request an appointment"
            description={`Choose a service, employee mode, date, and start time for ${resolvedShopId}, then submit the appointment request.`}
        >
            <SectionCard title="Quick navigation">
                <ActionGroup>
                    <BackAction label="Back to shop" fallbackHref={`/shops/${resolvedShopId}`} />
                    {status !== "authenticated" ? (
                        <ActionLink
                            href={{ pathname: "/sign-in", params: { returnTo } }}
                            label="Sign in to confirm"
                        />
                    ) : (
                        <ActionLink href="/appointments" label="Open appointments" variant="secondary" />
                    )}
                </ActionGroup>
            </SectionCard>

            <SectionCard title="Service">
                {companyQuery.isPending ? <ThemedText>Loading services…</ThemedText> : null}
                {services.length ? (
                    <ActionGroup>
                        {services.map((service) => (
                            <ActionButton
                                key={service.id}
                                label={`${service.name} · ${service.durationMinutes} min`}
                                variant={resolvedServiceId === service.id ? "primary" : "secondary"}
                                trailing={
                                    <ThemedText style={resolvedServiceId === service.id ? styles.primaryTrailing : styles.secondaryTrailing}>
                                        {(service.priceCents / 100).toFixed(2)}
                                    </ThemedText>
                                }
                                onPress={() => {
                                    setSelectedServiceId(service.id);
                                    setSelectedStartTime(null);
                                }}
                            />
                        ))}
                    </ActionGroup>
                ) : null}
            </SectionCard>

            <SectionCard title="Employee preference">
                <ActionGroup>
                    <ActionButton
                        label="Any employee"
                        variant={employeeMode === "any" ? "primary" : "secondary"}
                        onPress={() => {
                            setEmployeeMode("any");
                            setSelectedStartTime(null);
                        }}
                    />
                    <ActionButton
                        label="Choose employee"
                        variant={employeeMode === "specific" ? "primary" : "secondary"}
                        onPress={() => {
                            setEmployeeMode("specific");
                            setSelectedEmployeeId((current) => current ?? employees[0]?.userId ?? null);
                            setSelectedStartTime(null);
                        }}
                    />
                </ActionGroup>
                {employeeMode === "specific" ? (
                    employees.length ? (
                        <ActionGroup>
                            {employees.map((employee) => (
                                <ActionButton
                                    key={employee.userId}
                                    label={employee.user?.name ?? employee.userId}
                                    variant={selectedEmployeeId === employee.userId ? "primary" : "secondary"}
                                    onPress={() => {
                                        setSelectedEmployeeId(employee.userId);
                                        setSelectedStartTime(null);
                                    }}
                                />
                            ))}
                        </ActionGroup>
                    ) : (
                        <ThemedText>No employees are available for direct selection yet.</ThemedText>
                    )
                ) : null}
            </SectionCard>

            <SectionCard title="Date and notes">
                <View style={styles.fieldGroup}>
                    <TextInput
                        autoCapitalize="none"
                        onChangeText={(value) => {
                            setSelectedDate(value);
                            setSelectedStartTime(null);
                        }}
                        placeholder="YYYY-MM-DD"
                        style={styles.input}
                        value={selectedDate}
                    />
                    <TextInput
                        multiline
                        onChangeText={setNotesCustomer}
                        placeholder="Booking notes for the shop (optional)"
                        style={[styles.input, styles.notesInput]}
                        value={notesCustomer}
                    />
                </View>
                <BulletList
                    items={[
                        "Date must be in YYYY-MM-DD format.",
                        "Availability refreshes when service, employee mode, date, or employee changes.",
                    ]}
                />
            </SectionCard>

            <SectionCard title="Available start times">
                {availabilityInput === null ? (
                    <ThemedText>Select a service, date, and employee mode to load available times.</ThemedText>
                ) : null}
                {availabilityQuery.isPending ? <ThemedText>Loading availability…</ThemedText> : null}
                {availabilityQuery.isError ? (
                    <ThemedText>{getApiErrorMessage(availabilityQuery.error)}</ThemedText>
                ) : null}
                {availabilityQuery.data && availableTimes.length === 0 ? (
                    <ThemedText>No available times were returned for that selection.</ThemedText>
                ) : null}
                {availableTimes.length ? (
                    <ActionGroup>
                        {availableTimes.map((time) => (
                            <ActionButton
                                key={time}
                                label={formatStartTimeLabel(time)}
                                variant={selectedStartTime === time ? "primary" : "secondary"}
                                onPress={() => setSelectedStartTime(time)}
                            />
                        ))}
                    </ActionGroup>
                ) : null}
            </SectionCard>

            <SectionCard title="Confirm request">
                {selectedService ? (
                    <BulletList
                        items={[
                            `Service: ${selectedService.name}`,
                            `Duration: ${selectedService.durationMinutes} minutes`,
                            `Date: ${selectedDate || "Not selected"}`,
                            `Time: ${selectedStartTime ? formatStartTimeLabel(selectedStartTime) : "Not selected"}`,
                        ]}
                    />
                ) : (
                    <ThemedText>Select a service before confirming.</ThemedText>
                )}
                {createAppointment.isError ? <ThemedText>{getApiErrorMessage(createAppointment.error)}</ThemedText> : null}
                {status !== "authenticated" ? (
                    <ActionLink
                        href={{ pathname: "/sign-in", params: { returnTo } }}
                        label="Sign in before booking"
                    />
                ) : (
                    <ActionButton
                        label={createAppointment.isPending ? "Submitting…" : "Request appointment"}
                        onPress={() => {
                            if (!company || !selectedService || !selectedDate || !selectedStartTime) {
                                return;
                            }

                            if (employeeMode === "specific" && !selectedEmployeeId) {
                                return;
                            }

                            void createAppointment
                                .mutateAsync({
                                    companyId: company.id,
                                    serviceId: selectedService.id,
                                    startsAt: selectedStartTime,
                                    ...(employeeMode === "any"
                                        ? { assignAnyEmployee: true as const }
                                        : { employeeId: selectedEmployeeId as string }),
                                    ...(notesCustomer.trim() ? { notesCustomer: notesCustomer.trim() } : {}),
                                })
                                .then(() => {
                                    router.replace("/appointments");
                                });
                        }}
                        variant="primary"
                    />
                )}
            </SectionCard>
        </ScreenShell>
    );
}

const styles = StyleSheet.create({
    fieldGroup: {
        gap: 12,
    },
    input: {
        minHeight: 52,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(10, 126, 164, 0.35)",
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: "rgba(247, 248, 250, 0.9)",
    },
    notesInput: {
        minHeight: 96,
        textAlignVertical: "top",
    },
    primaryTrailing: {
        color: "#FFFFFF",
    },
    secondaryTrailing: {
        color: "#0A7EA4",
    },
});
