import { format, parseISO } from "date-fns";

export function getInitials(value: string) {
    return value
        .split(" ")
        .map((part) => part[0] ?? "")
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

export function formatTimeLabel(value: string) {
    return format(parseISO(value), "HH:mm");
}
