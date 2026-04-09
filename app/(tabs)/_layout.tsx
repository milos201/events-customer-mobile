import { Tabs } from "expo-router";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabsLayout() {
    const colorScheme = useColorScheme();
    const resolvedScheme = colorScheme ?? "light";

    return (
        <Tabs
            screenOptions={{
                tabBarButton: HapticTab,
                tabBarActiveTintColor: Colors[resolvedScheme].tint,
                headerTintColor: Colors[resolvedScheme].tint,
                headerShadowVisible: false,
            }}
        >
            <Tabs.Screen
                name="(discover)"
                options={{
                    title: "Discover",
                    headerShown: false,
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
                }}
            />
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
