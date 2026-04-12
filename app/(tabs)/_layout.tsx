import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, Fonts, Radius, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type TabIconName = "magnifyingglass" | "calendar" | "person.fill";
type TabTheme = (typeof Colors)[keyof typeof Colors];

type FloatingTabIconProps = {
    color: string;
    focused: boolean;
    name: TabIconName;
    theme: TabTheme;
};

function FloatingTabIcon({ color, focused, name, theme }: FloatingTabIconProps) {
    return (
        <View style={[styles.tabIcon, focused ? { backgroundColor: theme.tint } : null]}>
            <IconSymbol
                size={focused ? 15 : 24}
                name={name}
                color={focused ? theme.tintForeground : color}
                weight={focused ? "bold" : "regular"}
            />
        </View>
    );
}

export default function TabsLayout() {
    const colorScheme = useColorScheme();
    const resolvedScheme = colorScheme ?? "light";
    const theme = Colors[resolvedScheme];

    return (
        <Tabs
            screenOptions={{
                tabBarButton: HapticTab,
                tabBarActiveTintColor: theme.tint,
                tabBarInactiveTintColor: theme.textMuted,
                tabBarHideOnKeyboard: true,
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarItemStyle: styles.tabBarItem,
                tabBarStyle: [
                    styles.tabBar,
                    {
                        backgroundColor: theme.tabBarSurface,
                        borderColor: theme.tabBarBorder,
                        shadowColor: theme.tabBarShadow,
                    },
                ],
                headerShown: false,
                headerTintColor: theme.tint,
                headerShadowVisible: false,
            }}
        >
            <Tabs.Screen
                name="(discover)"
                options={{
                    title: "Discover",
                    tabBarIcon: ({ color, focused }) => (
                        <FloatingTabIcon color={color} focused={focused} name="magnifyingglass" theme={theme} />
                    ),
                }}
            />
            <Tabs.Screen
                name="appointments"
                options={{
                    title: "Appointments",
                    tabBarIcon: ({ color, focused }) => (
                        <FloatingTabIcon color={color} focused={focused} name="calendar" theme={theme} />
                    ),
                }}
            />
            <Tabs.Screen
                name="account"
                options={{
                    title: "Account",
                    tabBarIcon: ({ color, focused }) => (
                        <FloatingTabIcon color={color} focused={focused} name="person.fill" theme={theme} />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: "absolute",
        left: Spacing.xl,
        right: Spacing.xl,
        start: Spacing.xl,
        end: Spacing.xl,
        bottom: 10,
        height: 70,
        paddingTop: Spacing.xs,
        paddingBottom: 7,
        paddingHorizontal: 10,
        borderTopWidth: 0,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: Radius.xl,
        shadowOpacity: 0.18,
        shadowRadius: 22,
        shadowOffset: {
            width: 0,
            height: 10,
        },
        elevation: 8,
        overflow: Platform.select({
            web: "hidden",
            default: "visible",
        }),
    },
    tabBarItem: {
        height: 54,
        paddingVertical: 2,
        borderRadius: 24,
    },
    tabBarLabel: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: "500",
        fontFamily: Fonts.sans,
        letterSpacing: 0,
        marginTop: 1,
    },
    tabIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
});
