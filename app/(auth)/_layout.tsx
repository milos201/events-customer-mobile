import { Redirect, Stack, useLocalSearchParams, type Href } from "expo-router";

import { useAuthSession } from "@/features/auth/session-provider";

export default function AuthLayout() {
    const { status } = useAuthSession();
    const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
    const redirectHref: Href = returnTo && returnTo.startsWith("/") ? (returnTo as Href) : ("/" as Href);

    if (status === "loading") {
        return null;
    }

    if (status === "authenticated") {
        return <Redirect href={redirectHref} />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}
