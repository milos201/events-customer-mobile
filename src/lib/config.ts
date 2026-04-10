const FALLBACK_API_URL = "http://localhost:3000";
const DEFAULT_API_TIMEOUT_MS = 10_000;

function trimTrailingSlash(value: string) {
    return value.replace(/\/+$/, "");
}

function resolveApiBaseUrl() {
    const configuredValue = process.env.EXPO_PUBLIC_API_URL?.trim();

    if (!configuredValue) {
        return {
            value: FALLBACK_API_URL,
            source: "fallback" as const,
        };
    }

    return {
        value: configuredValue,
        source: "env" as const,
    };
}

function ensureHttpUrl(value: string, variableName: string) {
    let parsedUrl: URL;

    try {
        parsedUrl = new URL(value);
    } catch {
        throw new Error(`${variableName} must be a valid absolute URL. Received: ${value}`);
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        throw new Error(`${variableName} must start with http:// or https://. Received: ${value}`);
    }

    return trimTrailingSlash(parsedUrl.toString());
}

const resolvedApiBaseUrl = resolveApiBaseUrl();
const apiBaseUrl = ensureHttpUrl(resolvedApiBaseUrl.value, "EXPO_PUBLIC_API_URL");

export const appConfig = {
    api: {
        baseUrl: apiBaseUrl,
        v1Url: `${apiBaseUrl}/v1`,
        timeoutMs: DEFAULT_API_TIMEOUT_MS,
        source: resolvedApiBaseUrl.source,
    },
    auth: {
        baseUrl: `${apiBaseUrl}/v1/auth`,
        storagePrefix: "events-customer-mobile",
        scheme: "eventscustomermobile",
    },
} as const;
