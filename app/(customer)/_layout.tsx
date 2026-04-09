import { Redirect, Tabs, usePathname, type Href } from "expo-router";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useAuthSession } from "@/features/auth/session-provider";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function CustomerLayout() {
    const colorScheme = useColorScheme();
    const pathname = usePathname();
    const { status } = useAuthSession();

    if (status === "loading") {
        return null;
    }

    if (status !== "authenticated") {
        return <Redirect href={{ pathname: "/sign-in", params: { returnTo: String(pathname) } } as unknown as Href} />;
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
            }}
        >
            <Tabs.Screen
                name="appointments"
                options={{
                    title: "Appointments",
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
                }}
            />
            <Tabs.Screen
                name="account"
                options={{
                    title: "Account",
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
                }}
            />
        </Tabs>
    );
}
