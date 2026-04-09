import { appConfig } from "@/lib/config";
import { authClient } from "@/lib/auth-client";

type QueryValue = string | number | boolean | null | undefined;
type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type ApiRequestOptions = {
    query?: Record<string, QueryValue>;
    signal?: AbortSignal;
    headers?: HeadersInit;
    body?: JsonValue;
    timeoutMs?: number;
};

export class ApiError extends Error {
    status: number;
    body: unknown;
    url: string;

    constructor(message: string, status: number, body: unknown, url: string) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.body = body;
        this.url = url;
    }
}

export class ApiNetworkError extends Error {
    url: string;
    cause: unknown;

    constructor(message: string, url: string, cause: unknown) {
        super(message);
        this.name = "ApiNetworkError";
        this.url = url;
        this.cause = cause;
    }
}

function buildUrl(path: string, query?: Record<string, QueryValue>) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${appConfig.api.v1Url}${normalizedPath}`);

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

async function parseResponseBody(response: Response) {
    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
        return await response.json();
    }

    const text = await response.text();
    return text.length > 0 ? text : null;
}

function createTimeoutSignal(signal: AbortSignal | undefined, timeoutMs: number) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs);

    const abortFromParent = () => controller.abort(signal?.reason);

    if (signal) {
        if (signal.aborted) {
            abortFromParent();
        } else {
            signal.addEventListener("abort", abortFromParent, { once: true });
        }
    }

    return {
        signal: controller.signal,
        cleanup: () => {
            clearTimeout(timeoutId);
            if (signal) {
                signal.removeEventListener("abort", abortFromParent);
            }
        },
    };
}

async function request<T>(method: ApiMethod, path: string, options: ApiRequestOptions = {}): Promise<T> {
    const url = buildUrl(path, options.query);
    const { signal, cleanup } = createTimeoutSignal(options.signal, options.timeoutMs ?? appConfig.api.timeoutMs);
    const cookie = authClient.getCookie();
    const headers = new Headers(options.headers);

    headers.set("Accept", "application/json");

    if (options.body) {
        headers.set("Content-Type", "application/json");
    }

    if (cookie) {
        headers.set("Cookie", cookie);
    }

    try {
        const response = await fetch(url, {
            method,
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
            credentials: cookie ? "omit" : "include",
            signal,
        });

        const body = await parseResponseBody(response);

        if (!response.ok) {
            throw new ApiError(`Request failed with status ${response.status}`, response.status, body, url);
        }

        return body as T;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiNetworkError("Network request failed", url, error);
    } finally {
        cleanup();
    }
}

export async function apiGet<T>(path: string, options?: Omit<ApiRequestOptions, "body">): Promise<T> {
    return await request<T>("GET", path, options);
}

export async function apiPost<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return await request<T>("POST", path, options);
}
