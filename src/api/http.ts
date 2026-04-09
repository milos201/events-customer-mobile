import { apiV1Url } from "@/lib/config";

type QueryValue = string | number | boolean | null | undefined;

export class ApiError extends Error {
    status: number;
    body: unknown;

    constructor(message: string, status: number, body: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.body = body;
    }
}

function buildUrl(path: string, query?: Record<string, QueryValue>) {
    const url = new URL(`${apiV1Url}${path}`);

    if (!query) {
        return url.toString();
    }

    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null || value === "") {
            continue;
        }

        url.searchParams.set(key, String(value));
    }

    return url.toString();
}

export async function apiGet<T>(
    path: string,
    options?: {
        query?: Record<string, QueryValue>;
        signal?: AbortSignal;
    },
): Promise<T> {
    const response = await fetch(buildUrl(path, options?.query), {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
        signal: options?.signal,
    });

    if (!response.ok) {
        let body: unknown = null;

        try {
            body = await response.json();
        } catch {
            body = await response.text();
        }

        throw new ApiError(`Request failed with status ${response.status}`, response.status, body);
    }

    return (await response.json()) as T;
}
