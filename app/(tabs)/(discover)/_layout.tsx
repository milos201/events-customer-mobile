import { Stack } from "expo-router";

import { HeaderActionLink } from "@/components/ui/header-action-link";

export default function DiscoverLayout() {
    return (
        <Stack
            screenOptions={{
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: "Discover",
                }}
            />
            <Stack.Screen
                name="shops/[shopId]"
                options={{
                    title: "Shop",
                }}
            />
            <Stack.Screen
                name="booking/[shopId]"
                options={{
                    title: "Book appointment",
                    headerRight: () => <HeaderActionLink href="/appointments" label="Appointments" />,
                }}
            />
        </Stack>
    );
}
