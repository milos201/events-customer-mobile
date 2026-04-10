import { Stack } from "expo-router";

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
                    headerShown: false,
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
                    headerShown: false,
                }}
            />
        </Stack>
    );
}
