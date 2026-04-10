import { format, isFuture, isToday, isTomorrow, parseISO } from "date-fns";

import type { AppointmentRecord } from "@/api/types";

export function canCancelAppointment(appointment: AppointmentRecord) {
    return (
        (appointment.status === "pending" || appointment.status === "confirmed") &&
        isFuture(parseISO(appointment.startsAt))
    );
}

export function isUpcomingAppointment(appointment: AppointmentRecord) {
    return canCancelAppointment(appointment);
}

export function formatAppointmentDateLabel(value: string) {
    const date = parseISO(value);

    if (isToday(date)) {
        return "Today";
    }

    if (isTomorrow(date)) {
        return "Tomorrow";
    }

    return format(date, "MMM d");
}
