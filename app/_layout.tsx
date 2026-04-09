import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppProviders } from "@/providers/app-providers";

export const unstable_settings = {
    anchor: "(tabs)",
};

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const resolvedScheme = colorScheme ?? "light";

    return (
        <AppProviders>
            <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
                <Stack
                    screenOptions={{
                        headerTintColor: Colors[resolvedScheme].tint,
                        headerShadowVisible: false,
                    }}
                >
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen
                        name="(auth)/sign-in"
                        options={{
                            headerShown: false,
                            presentation: "modal",
                            animation: "slide_from_bottom",
                            gestureEnabled: true,
                        }}
                    />
                </Stack>
                <StatusBar style="auto" />
            </ThemeProvider>
        </AppProviders>
    );
}
