export function getInitials(value: string) {
    return value
        .split(" ")
        .map((part) => part[0] ?? "")
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

export function formatTimeLabel(value: string) {
    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(value));
}
