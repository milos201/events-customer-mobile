import { Tabs, useRouter, type Href } from "expo-router";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useAuthSession } from "@/features/auth/session-provider";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabsLayout() {
    const colorScheme = useColorScheme();
    const router = useRouter();
    const { status } = useAuthSession();

    function getProtectedTabButton(returnTo: Href) {
        return function ProtectedTabButton(props: React.ComponentProps<typeof HapticTab>) {
            if (status === "authenticated") {
                return <HapticTab {...props} />;
            }

            return (
                <HapticTab
                    {...props}
                    onPress={() => {
                        router.push({ pathname: "/sign-in", params: { returnTo: String(returnTo) } } as unknown as Href);
                    }}
                />
            );
        };
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
                name="(discover)"
                options={{
                    title: "Discover",
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
                }}
            />
            <Tabs.Screen
                name="appointments"
                options={{
                    title: "Appointments",
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
                    tabBarButton: getProtectedTabButton("/appointments" as Href),
                }}
            />
            <Tabs.Screen
                name="account"
                options={{
                    title: "Account",
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
                    tabBarButton: getProtectedTabButton("/account" as Href),
                }}
            />
        </Tabs>
    );
}
