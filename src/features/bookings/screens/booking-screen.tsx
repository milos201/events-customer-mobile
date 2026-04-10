import { type Href, useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ApiError, ApiUnauthorizedError } from "@/api/http";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuthSession } from "@/features/auth/session-provider";
import { useBookingAvailability, useCreateAppointment } from "@/features/bookings/queries";
import { usePublicCompanyBundle } from "@/features/shops/queries";
import { useAppTheme } from "@/hooks/use-app-theme";
import { formatTimeLabel, getInitials } from "@/lib/formatters";
import { Fonts, Radius, Shadows, Spacing, Typography } from "@/theme";

type BookingStep = 1 | 2 | 3 | 4;
type BarberChoice = "any" | string;

type StepMeta = {
    heading: string;
    description: string;
};

const STEP_META: Record<BookingStep, StepMeta> = {
    1: {
        heading: "Choose a Barber",
        description: "Select your preferred barber or any available.",
    },
    2: {
        heading: "Select a Service",
        description: "Choose what you need done.",
    },
    3: {
        heading: "Pick Date & Time",
        description: "Choose when you want to come in.",
    },
    4: {
        heading: "Confirm Booking",
        description: "Review your appointment details.",
    },
};

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

function addDays(date: Date, amount: number) {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + amount);
    return nextDate;
}

function getBookingDays(count: number) {
    return Array.from({ length: count }, (_, index) => toLocalDateInputValue(addDays(new Date(), index)));
}

function formatSummaryDate(value: string) {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    }).format(new Date(value));
}

function formatSummaryDateFromDay(value: string) {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    }).format(fromLocalDateInputValue(value));
}

function formatDateChip(value: string) {
    const date = fromLocalDateInputValue(value);
    const todayValue = toLocalDateInputValue(new Date());
    const tomorrowValue = toLocalDateInputValue(addDays(new Date(), 1));

    return {
        eyebrow:
            value === todayValue
                ? "Today"
                : value === tomorrowValue
                  ? "Tomorrow"
                  : new Intl.DateTimeFormat("en-US", {
                        weekday: "short",
                    }).format(date),
        day: new Intl.DateTimeFormat("en-US", {
            day: "numeric",
        }).format(date),
    };
}

function formatPrice(priceCents: number) {
    const dollars = priceCents / 100;
    return Number.isInteger(dollars) ? `$${dollars.toFixed(0)}` : `$${dollars.toFixed(2)}`;
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

function StepProgress({ step, tintColor, trackColor }: { step: BookingStep; tintColor: string; trackColor: string }) {
    return (
        <View style={styles.progressRow}>
            {Array.from({ length: 4 }, (_, index) => (
                <View
                    // biome-ignore lint/suspicious/noArrayIndexKey: step indicators are static
                    key={index}
                    style={[styles.progressSegment, { backgroundColor: index < step ? tintColor : trackColor }]}
                />
            ))}
        </View>
    );
}

function SummaryItem({
    label,
    primary,
    secondary,
    labelColor,
    secondaryColor,
}: {
    label: string;
    primary: string;
    secondary?: string;
    labelColor: string;
    secondaryColor: string;
}) {
    return (
        <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryLabel, { color: labelColor }]}>{label}</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.summaryPrimary}>
                {primary}
            </ThemedText>
            {secondary ? (
                <ThemedText style={[styles.summarySecondary, { color: secondaryColor }]}>{secondary}</ThemedText>
            ) : null}
        </View>
    );
}

export function BookingScreen() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();
    const theme = useAppTheme();
    const { status } = useAuthSession();
    const { shopId } = useLocalSearchParams<{ shopId: string }>();
    const resolvedShopId = shopId ?? "shop";
    const companyQuery = usePublicCompanyBundle(resolvedShopId);
    const company = companyQuery.data?.company;
    const employees = company?.employees ?? [];
    const services = companyQuery.data?.services ?? [];
    const returnTo = String(pathname);

    const [step, setStep] = useState<BookingStep>(1);
    const [selectedBarberId, setSelectedBarberId] = useState<BarberChoice | null>(null);
    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState(toLocalDateInputValue(new Date()));
    const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const selectedBarber =
        selectedBarberId && selectedBarberId !== "any"
            ? (employees.find((employee) => employee.userId === selectedBarberId) ?? null)
            : null;
    const selectedService = services.find((service) => service.id === selectedServiceId) ?? null;
    const bookingDays = useMemo(() => getBookingDays(7), []);

    const availabilityInput =
        company && selectedService && selectedBarberId
            ? selectedBarberId === "any"
                ? {
                      companyId: company.id,
                      serviceId: selectedService.id,
                      date: selectedDate,
                      assignAnyEmployee: true as const,
                  }
                : {
                      companyId: company.id,
                      serviceId: selectedService.id,
                      date: selectedDate,
                      employeeId: selectedBarberId,
                  }
            : null;

    const availabilityQuery = useBookingAvailability(availabilityInput);
    const createAppointment = useCreateAppointment();
    const availableTimes = availabilityQuery.data?.startTimes ?? [];

    useEffect(() => {
        if (!createAppointment.isSuccess || !createAppointment.data) {
            return;
        }

        setSuccessMessage(
            `Appointment requested at ${createAppointment.data.company?.name ?? "the shop"}. Redirecting to appointments…`,
        );

        const timeoutId = setTimeout(() => {
            router.dismissAll();
            router.navigate("/appointments" as Href);
        }, 900);

        return () => clearTimeout(timeoutId);
    }, [createAppointment.data, createAppointment.isSuccess, router]);

    function handleBackPress() {
        if (step > 1) {
            setStep((currentStep) => (currentStep - 1) as BookingStep);
            return;
        }

        if (router.canGoBack()) {
            router.back();
            return;
        }

        router.replace({
            pathname: "/shops/[shopId]",
            params: { shopId: resolvedShopId },
        } as Href);
    }

    function handleSelectBarber(nextBarberId: BarberChoice) {
        setSelectedBarberId(nextBarberId);
        setSelectedStartTime(null);
        setStep(2);
    }

    function handleSelectService(nextServiceId: number) {
        setSelectedServiceId(nextServiceId);
        setSelectedStartTime(null);
        setStep(3);
    }

    function handleSelectDate(nextDate: string) {
        setSelectedDate(nextDate);
        setSelectedStartTime(null);
    }

    function handleSelectStartTime(nextStartTime: string) {
        setSelectedStartTime(nextStartTime);
        setStep(4);
    }

    async function handleConfirmPress() {
        if (!company || !selectedService || !selectedStartTime || !selectedBarberId) {
            return;
        }

        if (status !== "authenticated") {
            router.push({
                pathname: "/sign-in",
                params: { returnTo },
            } as Href);
            return;
        }

        setSuccessMessage(null);
        createAppointment.reset();

        await createAppointment.mutateAsync({
            companyId: company.id,
            serviceId: selectedService.id,
            startsAt: selectedStartTime,
            ...(selectedBarberId === "any" ? { assignAnyEmployee: true as const } : { employeeId: selectedBarberId }),
        });
    }

    const activeStepMeta = STEP_META[step];
    const barberSummaryLabel =
        selectedBarberId === "any"
            ? "Any Available"
            : (selectedBarber?.user?.name ?? selectedBarber?.userId ?? "Not selected");
    const shopAddress = [company?.address, company?.city].filter(Boolean).join(", ") || "Address not available";

    return (
        <View style={[styles.screen, { backgroundColor: theme.backgroundCanvas }]}>
            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    {
                        paddingTop: insets.top + Spacing.md,
                        paddingBottom: insets.bottom + Spacing.xl + (step === 4 ? 96 : 0),
                    },
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headerBlock}>
                    <View style={styles.headerRow}>
                        <Pressable
                            onPress={handleBackPress}
                            style={[
                                styles.backButton,
                                Shadows.card,
                                { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                            ]}
                        >
                            <IconSymbol color={theme.text} name="chevron.left" size={20} />
                        </Pressable>
                        <View style={styles.headerCopy}>
                            <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
                                Book Appointment
                            </ThemedText>
                            <ThemedText style={[styles.headerSubtitle, { color: theme.textMuted }]}>
                                Step {step} of 4
                            </ThemedText>
                        </View>
                    </View>

                    <StepProgress step={step} tintColor={theme.tint} trackColor={theme.border} />
                </View>

                <View style={styles.stepCopy}>
                    <ThemedText type="subtitle">{activeStepMeta.heading}</ThemedText>
                    <ThemedText style={[styles.stepDescription, { color: theme.textMuted }]}>
                        {activeStepMeta.description}
                    </ThemedText>
                </View>

                {step === 1 ? (
                    <View style={styles.stack}>
                        <Pressable
                            onPress={() => handleSelectBarber("any")}
                            style={[
                                styles.optionCard,
                                Shadows.card,
                                {
                                    backgroundColor: selectedBarberId === "any" ? theme.surface : theme.surfaceElevated,
                                    borderColor: selectedBarberId === "any" ? theme.borderStrong : theme.border,
                                },
                            ]}
                        >
                            <View style={[styles.avatar, { backgroundColor: theme.surfaceMuted }]}>
                                <IconSymbol color={theme.tint} name="person.fill" size={18} />
                            </View>
                            <View style={styles.optionCopy}>
                                <ThemedText type="defaultSemiBold">Any Available</ThemedText>
                                <ThemedText style={[styles.optionMeta, { color: theme.textMuted }]}>
                                    First available barber
                                </ThemedText>
                            </View>
                            <IconSymbol color={theme.textSubtle} name="chevron.right" size={18} />
                        </Pressable>

                        {employees.map((employee) => {
                            const employeeName = employee.user?.name ?? employee.userId;
                            const isSelected = selectedBarberId === employee.userId;

                            return (
                                <Pressable
                                    key={employee.userId}
                                    onPress={() => handleSelectBarber(employee.userId)}
                                    style={[
                                        styles.optionCard,
                                        Shadows.card,
                                        {
                                            backgroundColor: isSelected ? theme.surface : theme.surfaceElevated,
                                            borderColor: isSelected ? theme.borderStrong : theme.border,
                                        },
                                    ]}
                                >
                                    <View style={[styles.avatar, { backgroundColor: theme.surfaceMuted }]}>
                                        <ThemedText style={styles.avatarLabel}>{getInitials(employeeName)}</ThemedText>
                                    </View>
                                    <View style={styles.optionCopy}>
                                        <ThemedText type="defaultSemiBold">{employeeName}</ThemedText>
                                        <ThemedText style={[styles.optionMeta, { color: theme.textMuted }]}>
                                            Available for booking
                                        </ThemedText>
                                    </View>
                                    <IconSymbol color={theme.textSubtle} name="chevron.right" size={18} />
                                </Pressable>
                            );
                        })}
                    </View>
                ) : null}

                {step === 2 ? (
                    companyQuery.isPending ? (
                        <ThemedText>Loading services…</ThemedText>
                    ) : services.length ? (
                        <View style={styles.stack}>
                            {services.map((service) => {
                                const isSelected = selectedServiceId === service.id;

                                return (
                                    <Pressable
                                        key={service.id}
                                        onPress={() => handleSelectService(service.id)}
                                        style={[
                                            styles.optionCard,
                                            Shadows.card,
                                            {
                                                backgroundColor: isSelected ? theme.surface : theme.surfaceElevated,
                                                borderColor: isSelected ? theme.borderStrong : theme.border,
                                            },
                                        ]}
                                    >
                                        <View style={styles.optionCopy}>
                                            <ThemedText type="defaultSemiBold">{service.name}</ThemedText>
                                            <ThemedText style={[styles.optionMeta, { color: theme.textMuted }]}>
                                                {service.durationMinutes} min
                                            </ThemedText>
                                        </View>
                                        <View style={styles.serviceTrailing}>
                                            <ThemedText type="defaultSemiBold">
                                                {formatPrice(service.priceCents)}
                                            </ThemedText>
                                            <IconSymbol color={theme.textSubtle} name="chevron.right" size={18} />
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </View>
                    ) : (
                        <ThemedText>No services are available for this shop.</ThemedText>
                    )
                ) : null}

                {step === 3 ? (
                    <View style={styles.stack}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.dateRow}
                        >
                            {bookingDays.map((dayValue) => {
                                const dateLabel = formatDateChip(dayValue);
                                const isSelected = selectedDate === dayValue;

                                return (
                                    <Pressable
                                        key={dayValue}
                                        onPress={() => handleSelectDate(dayValue)}
                                        style={[
                                            styles.dateChip,
                                            {
                                                backgroundColor: isSelected ? theme.tint : theme.surfaceElevated,
                                                borderColor: isSelected ? theme.tint : theme.border,
                                            },
                                            Shadows.card,
                                        ]}
                                    >
                                        <ThemedText
                                            style={[
                                                styles.dateChipEyebrow,
                                                { color: isSelected ? theme.tintForeground : theme.textMuted },
                                            ]}
                                        >
                                            {dateLabel.eyebrow}
                                        </ThemedText>
                                        <ThemedText
                                            style={[
                                                styles.dateChipDay,
                                                { color: isSelected ? theme.tintForeground : theme.text },
                                            ]}
                                        >
                                            {dateLabel.day}
                                        </ThemedText>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>

                        <View style={[styles.inlineDivider, { backgroundColor: theme.border }]} />

                        <View style={styles.timeSection}>
                            <ThemedText type="defaultSemiBold">Available Times</ThemedText>
                            {availabilityInput === null ? (
                                <ThemedText style={{ color: theme.textMuted }}>
                                    Choose a barber and service before selecting a time.
                                </ThemedText>
                            ) : null}
                            {availabilityQuery.isPending ? (
                                <ThemedText style={{ color: theme.textMuted }}>Loading availability…</ThemedText>
                            ) : null}
                            {availabilityQuery.isError ? (
                                <ThemedText style={{ color: theme.textMuted }}>
                                    {getApiErrorMessage(availabilityQuery.error)}
                                </ThemedText>
                            ) : null}
                            {availabilityQuery.data && availableTimes.length === 0 ? (
                                <ThemedText style={{ color: theme.textMuted }}>
                                    No times are currently available for this day.
                                </ThemedText>
                            ) : null}

                            {availableTimes.length ? (
                                <View style={styles.timeGrid}>
                                    {availableTimes.map((time) => {
                                        const isSelected = selectedStartTime === time;

                                        return (
                                            <Pressable
                                                key={time}
                                                onPress={() => handleSelectStartTime(time)}
                                                style={[
                                                    styles.timeChip,
                                                    {
                                                        backgroundColor: isSelected
                                                            ? theme.tint
                                                            : theme.surfaceElevated,
                                                        borderColor: isSelected ? theme.tint : theme.border,
                                                    },
                                                ]}
                                            >
                                                <ThemedText
                                                    style={[
                                                        styles.timeChipLabel,
                                                        { color: isSelected ? theme.tintForeground : theme.text },
                                                    ]}
                                                >
                                                    {formatTimeLabel(time)}
                                                </ThemedText>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            ) : null}
                        </View>
                    </View>
                ) : null}

                {step === 4 ? (
                    <View style={styles.stack}>
                        <View
                            style={[
                                styles.summaryCard,
                                Shadows.card,
                                { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                            ]}
                        >
                            <SummaryItem
                                label="Shop"
                                primary={company?.name ?? "Shop"}
                                secondary={shopAddress}
                                labelColor={theme.textSubtle}
                                secondaryColor={theme.textMuted}
                            />
                            <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
                            <SummaryItem
                                label="Barber"
                                primary={barberSummaryLabel}
                                secondary={selectedBarberId === "any" ? "First available barber" : "Preferred barber"}
                                labelColor={theme.textSubtle}
                                secondaryColor={theme.textMuted}
                            />
                            <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
                            <SummaryItem
                                label="Service"
                                primary={selectedService?.name ?? "Not selected"}
                                secondary={selectedService ? `${selectedService.durationMinutes} min` : undefined}
                                labelColor={theme.textSubtle}
                                secondaryColor={theme.textMuted}
                            />
                            <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
                            <SummaryItem
                                label="Date & Time"
                                primary={
                                    selectedStartTime
                                        ? formatSummaryDate(selectedStartTime)
                                        : formatSummaryDateFromDay(selectedDate)
                                }
                                secondary={selectedStartTime ? formatTimeLabel(selectedStartTime) : "Not selected"}
                                labelColor={theme.textSubtle}
                                secondaryColor={theme.textMuted}
                            />
                        </View>

                        {createAppointment.isError ? (
                            <ThemedText style={[styles.feedbackText, { color: theme.danger }]}>
                                {getApiErrorMessage(createAppointment.error)}
                            </ThemedText>
                        ) : null}

                        {successMessage ? (
                            <ThemedText style={[styles.feedbackText, { color: theme.success }]}>
                                {successMessage}
                            </ThemedText>
                        ) : null}
                    </View>
                ) : null}
            </ScrollView>

            {step === 4 ? (
                <View
                    style={[
                        styles.ctaWrap,
                        {
                            backgroundColor: theme.backgroundCanvas,
                            paddingBottom: insets.bottom + Spacing.sm,
                        },
                    ]}
                >
                    <Pressable
                        onPress={() => {
                            void handleConfirmPress();
                        }}
                        style={[styles.ctaButton, Shadows.floating, { backgroundColor: theme.tint }]}
                    >
                        <ThemedText style={[styles.ctaLabel, { color: theme.tintForeground }]}>
                            {createAppointment.isPending
                                ? "Submitting…"
                                : status === "authenticated"
                                  ? "Confirm Booking"
                                  : "Sign in to confirm"}
                        </ThemedText>
                    </Pressable>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    content: {
        paddingHorizontal: Spacing.md,
        gap: Spacing.lg,
    },
    headerBlock: {
        gap: Spacing.md,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: Radius.full,
        borderWidth: StyleSheet.hairlineWidth,
        alignItems: "center",
        justifyContent: "center",
    },
    headerCopy: {
        gap: 2,
    },
    headerTitle: {
        fontFamily: Fonts.sans,
    },
    headerSubtitle: {
        ...Typography.bodySm,
        fontFamily: Fonts.sans,
    },
    progressRow: {
        flexDirection: "row",
        gap: Spacing.xs,
    },
    progressSegment: {
        flex: 1,
        height: 4,
        borderRadius: Radius.full,
    },
    stepCopy: {
        gap: 4,
    },
    stepDescription: {
        ...Typography.bodySm,
        fontFamily: Fonts.sans,
    },
    stack: {
        gap: Spacing.md,
    },
    optionCard: {
        minHeight: 84,
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: Spacing.md,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: Radius.full,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarLabel: {
        ...Typography.label,
        fontWeight: "700",
    },
    optionCopy: {
        flex: 1,
        gap: 2,
    },
    optionMeta: {
        ...Typography.bodySm,
        fontFamily: Fonts.sans,
    },
    serviceTrailing: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs,
    },
    dateRow: {
        gap: Spacing.xs,
    },
    dateChip: {
        width: 72,
        minHeight: 86,
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
    },
    dateChipEyebrow: {
        ...Typography.label,
        fontFamily: Fonts.sans,
    },
    dateChipDay: {
        fontSize: 26,
        lineHeight: 30,
        fontWeight: "700",
        fontFamily: Fonts.sans,
    },
    inlineDivider: {
        height: StyleSheet.hairlineWidth,
    },
    timeSection: {
        gap: Spacing.md,
    },
    timeGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: Spacing.xs,
    },
    timeChip: {
        width: "31.5%",
        minHeight: 48,
        borderRadius: Radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: Spacing.xs,
    },
    timeChipLabel: {
        ...Typography.bodySm,
        fontFamily: Fonts.sans,
        fontWeight: "600",
    },
    summaryCard: {
        borderRadius: Radius.xl,
        borderWidth: StyleSheet.hairlineWidth,
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    summaryItem: {
        gap: 4,
    },
    summaryLabel: {
        ...Typography.label,
        fontFamily: Fonts.sans,
    },
    summaryPrimary: {
        fontFamily: Fonts.sans,
    },
    summarySecondary: {
        ...Typography.bodySm,
        fontFamily: Fonts.sans,
    },
    summaryDivider: {
        height: StyleSheet.hairlineWidth,
    },
    feedbackText: {
        ...Typography.bodySm,
        fontFamily: Fonts.sans,
    },
    ctaWrap: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.sm,
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
        fontFamily: Fonts.sans,
    },
});
