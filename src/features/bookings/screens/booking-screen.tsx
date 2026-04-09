import { useEffect, useMemo, useState } from "react";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useLocalSearchParams, usePathname, useRouter, type Href } from "expo-router";
import { Platform, StyleSheet, TextInput, View } from "react-native";

import { ApiError, ApiUnauthorizedError } from "@/api/http";
import { ThemedText } from "@/components/themed-text";
import { useAuthSession } from "@/features/auth/session-provider";
import { useCreateAppointment, useBookingAvailability } from "@/features/bookings/queries";
import { usePublicCompanyBundle } from "@/features/shops/queries";
import { ActionButton, ActionGroup, ActionLink, BulletList, ScreenShell, SectionCard } from "@/ui/screen-shell";

function toLocalDateInputValue(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function fromLocalDateInputValue(value: string) {
    const [year, month, day] = value.split("-").map(Number);

    return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function getApiErrorMessage(error: unknown) {
    if (error instanceof ApiUnauthorizedError) {
        return error.message;
    }

    if (error instanceof ApiError && error.status === 409) {
        return "That time is no longer available. Pick another slot.";
    }

    if (error instanceof ApiError && error.status === 400) {
        if (error.body && typeof error.body === "object" && "message" in error.body) {
            const message = (error.body as { message?: unknown }).message;
            if (typeof message === "string" && message.length > 0) {
                return message;
            }
        }

        return "Please review your booking details and try again.";
    }

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

function formatSelectedDateLabel(value: string) {
    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "full",
    }).format(fromLocalDateInputValue(value));
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
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

    const returnTo = resolvedServiceId ? `${String(pathname)}?serviceId=${resolvedServiceId}` : String(pathname);

    useEffect(() => {
        if (!createAppointment.isSuccess || !createAppointment.data) {
            return;
        }

        setSuccessMessage(
            `Appointment requested at ${createAppointment.data.company?.name ?? "the shop"}. Redirecting to appointments…`,
        );

        const timeoutId = setTimeout(() => {
            router.replace("/appointments" as Href);
        }, 900);

        return () => clearTimeout(timeoutId);
    }, [createAppointment.data, createAppointment.isSuccess, router]);

    function handleDateChange(event: DateTimePickerEvent, nextDate?: Date) {
        if (Platform.OS !== "ios") {
            setIsDatePickerVisible(false);
        }

        if (event.type !== "set" || !nextDate) {
            return;
        }

        setSelectedDate(toLocalDateInputValue(nextDate));
        setSelectedStartTime(null);
    }

    return (
        <ScreenShell title="Book appointment" showHero={false}>
            {status !== "authenticated" ? (
                <SectionCard title="Actions">
                    <ActionLink
                        href={{ pathname: "/sign-in", params: { returnTo } } as unknown as Href}
                        label="Sign in to confirm"
                    />
                </SectionCard>
            ) : null}

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
                    <ActionButton
                        label={formatSelectedDateLabel(selectedDate)}
                        variant="secondary"
                        onPress={() => setIsDatePickerVisible((current) => !current)}
                    />
                    {isDatePickerVisible ? (
                        <View style={styles.datePickerWrap}>
                            <DateTimePicker
                                display={Platform.OS === "ios" ? "inline" : "default"}
                                minimumDate={new Date()}
                                mode="date"
                                onChange={handleDateChange}
                                value={fromLocalDateInputValue(selectedDate)}
                            />
                            {Platform.OS === "ios" ? (
                                <ActionButton
                                    label="Done picking date"
                                    variant="secondary"
                                    onPress={() => setIsDatePickerVisible(false)}
                                />
                            ) : null}
                        </View>
                    ) : null}
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
                        "Pick a date before choosing a time slot.",
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
                {successMessage ? <ThemedText>{successMessage}</ThemedText> : null}
                {createAppointment.isError ? <ThemedText>{getApiErrorMessage(createAppointment.error)}</ThemedText> : null}
                {status !== "authenticated" ? (
                    <ActionLink
                        href={{ pathname: "/sign-in", params: { returnTo } } as unknown as Href}
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

                            setSuccessMessage(null);
                            createAppointment.reset();
                            void createAppointment.mutateAsync({
                                companyId: company.id,
                                serviceId: selectedService.id,
                                startsAt: selectedStartTime,
                                ...(employeeMode === "any"
                                    ? { assignAnyEmployee: true as const }
                                    : { employeeId: selectedEmployeeId as string }),
                                ...(notesCustomer.trim() ? { notesCustomer: notesCustomer.trim() } : {}),
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
    datePickerWrap: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(10, 126, 164, 0.2)",
        padding: 8,
        gap: 8,
    },
    primaryTrailing: {
        color: "#FFFFFF",
    },
    secondaryTrailing: {
        color: "#0A7EA4",
    },
});
