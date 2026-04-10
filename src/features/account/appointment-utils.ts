import type { AppointmentRecord } from "@/api/types";

export function canCancelAppointment(appointment: AppointmentRecord) {
    const startsAt = new Date(appointment.startsAt);
    return (appointment.status === "pending" || appointment.status === "confirmed") && startsAt.getTime() > Date.now();
}

export function isUpcomingAppointment(appointment: AppointmentRecord) {
    return canCancelAppointment(appointment);
}

export function formatAppointmentDateLabel(value: string) {
    const date = new Date(value);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
        return "Today";
    }

    if (date.toDateString() === tomorrow.toDateString()) {
        return "Tomorrow";
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
    }).format(date);
}
