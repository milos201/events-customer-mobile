const FALLBACK_API_URL = "http://localhost:3000";

function trimTrailingSlash(value: string) {
    return value.replace(/\/+$/, "");
}

export const apiBaseUrl = trimTrailingSlash(process.env.EXPO_PUBLIC_API_URL ?? FALLBACK_API_URL);
export const apiV1Url = `${apiBaseUrl}/v1`;
