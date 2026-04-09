import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuthSession } from "@/features/auth/session-provider";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ActionButton } from "@/ui/screen-shell";

export function SignInScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { returnTo, mode } = useLocalSearchParams<{ returnTo?: string; mode?: string }>();
    const { status, signIn, createAccount } = useAuthSession();
    const safeReturnTo: Href = returnTo && returnTo.startsWith("/") ? (returnTo as Href) : ("/" as Href);
    const [authMode, setAuthMode] = useState<"sign-in" | "create-account">(mode === "create-account" ? "create-account" : "sign-in");
    const isCreateAccount = authMode === "create-account";
    const textColor = useThemeColor({}, "text");
    const mutedColor = useThemeColor({ light: "#6B7280", dark: "#8E8E93" }, "icon");
    const borderColor = useThemeColor({ light: "rgba(60, 60, 67, 0.18)", dark: "rgba(84, 84, 88, 0.65)" }, "icon");
    const sheetColor = useThemeColor({ light: "#FFFFFF", dark: "#1C1C1E" }, "background");
    const inputColor = useThemeColor({ light: "#F2F2F7", dark: "#151718" }, "background");
    const accentColor = useThemeColor({ light: "#0A84FF", dark: "#0A84FF" }, "tint");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const bookingFallbackHref: Href =
        safeReturnTo.toString().startsWith("/booking/") || safeReturnTo.toString().startsWith("/(public)/booking/")
            ? safeReturnTo
            : "/";

    function dismiss() {
        if (router.canGoBack()) {
            router.back();
            return;
        }

        router.replace(bookingFallbackHref);
    }

    useEffect(() => {
        if (status === "authenticated") {
            router.replace(safeReturnTo);
        }
    }, [router, safeReturnTo, status]);

    useEffect(() => {
        setAuthMode(mode === "create-account" ? "create-account" : "sign-in");
    }, [mode]);

    if (status === "loading") {
        return null;
    }

    return (
        <ThemedView style={styles.screen}>
            <KeyboardAvoidingView
                style={styles.screen}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={insets.top + 8}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.content,
                        {
                            paddingTop: insets.top + 16,
                            paddingBottom: insets.bottom + 24,
                        },
                    ]}
                    keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.topBar}>
                        <Pressable onPress={dismiss}>
                            <ThemedText style={[styles.dismissText, { color: mutedColor }]}>Not now</ThemedText>
                        </Pressable>
                    </View>

                    <ThemedView
                        style={[
                            styles.sheet,
                            {
                                backgroundColor: sheetColor,
                                borderColor,
                            },
                        ]}
                    >
                        <View style={styles.header}>
                            <ThemedText type="title" style={styles.title}>
                                {isCreateAccount ? "Create account" : "Sign in"}
                            </ThemedText>
                            <ThemedText style={[styles.description, { color: mutedColor }]}>
                                {isCreateAccount ? "Create an account and continue where you left off." : "Continue to your bookings and appointments."}
                            </ThemedText>
                        </View>

                        <View style={styles.segmentRow}>
                            {[
                                { key: "sign-in", label: "Sign in" },
                                { key: "create-account", label: "Create account" },
                            ].map((option) => {
                                const selected =
                                    (option.key === "create-account" && isCreateAccount) || (option.key === "sign-in" && !isCreateAccount);

                                return (
                                    <Pressable
                                        key={option.key}
                                        onPress={() => {
                                            setAuthMode(option.key === "create-account" ? "create-account" : "sign-in");
                                            setErrorMessage(null);
                                        }}
                                        style={[
                                            styles.segment,
                                            {
                                                backgroundColor: selected ? accentColor : inputColor,
                                                borderColor,
                                            },
                                        ]}
                                    >
                                        <ThemedText style={[styles.segmentText, { color: selected ? "#FFFFFF" : textColor }]}>
                                            {option.label}
                                        </ThemedText>
                                    </Pressable>
                                );
                            })}
                        </View>

                        <View style={styles.fieldGroup}>
                            {isCreateAccount ? (
                                <TextInput
                                    autoCapitalize="words"
                                    autoComplete="name"
                                    onChangeText={setName}
                                    placeholder="Your name"
                                    placeholderTextColor={mutedColor}
                                    style={[styles.input, { backgroundColor: inputColor, borderColor, color: textColor }]}
                                    value={name}
                                />
                            ) : null}
                            <TextInput
                                autoCapitalize="none"
                                autoComplete="email"
                                keyboardType="email-address"
                                onChangeText={setEmail}
                                placeholder="customer@example.com"
                                placeholderTextColor={mutedColor}
                                style={[styles.input, { backgroundColor: inputColor, borderColor, color: textColor }]}
                                value={email}
                            />
                            <TextInput
                                autoCapitalize="none"
                                autoComplete="password"
                                onChangeText={setPassword}
                                placeholder="Password"
                                placeholderTextColor={mutedColor}
                                secureTextEntry
                                style={[styles.input, { backgroundColor: inputColor, borderColor, color: textColor }]}
                                value={password}
                            />
                        </View>

                        {errorMessage ? <ThemedText style={styles.errorText}>{errorMessage}</ThemedText> : null}

                        <ActionButton
                            label={
                                isSubmitting
                                    ? isCreateAccount
                                        ? "Creating account…"
                                        : "Signing in…"
                                    : isCreateAccount
                                      ? "Create account"
                                      : "Sign in"
                            }
                            onPress={async () => {
                                const trimmedName = name.trim();
                                const trimmedEmail = email.trim();

                                if (isCreateAccount && !trimmedName) {
                                    setErrorMessage("Name is required.");
                                    return;
                                }

                                if (!trimmedEmail || !password) {
                                    setErrorMessage(isCreateAccount ? "Name, email, and password are required." : "Email and password are required.");
                                    return;
                                }

                                setIsSubmitting(true);
                                setErrorMessage(null);

                                const error = isCreateAccount
                                    ? await createAccount({
                                          name: trimmedName,
                                          email: trimmedEmail,
                                          password,
                                      })
                                    : await signIn({
                                          email: trimmedEmail,
                                          password,
                                      });

                                setIsSubmitting(false);

                                if (error) {
                                    setErrorMessage(error);
                                    return;
                                }

                                router.replace(safeReturnTo);
                            }}
                        />

                        <ThemedText style={[styles.footnote, { color: mutedColor }]}>
                            You will return to {safeReturnTo.toString() === "/" ? "Discover" : "where you left off"}.
                        </ThemedText>
                    </ThemedView>
                </ScrollView>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: 16,
        justifyContent: "flex-end",
        gap: 16,
    },
    topBar: {
        alignItems: "flex-end",
    },
    dismissText: {
        fontSize: 16,
        lineHeight: 20,
    },
    sheet: {
        borderRadius: 24,
        borderWidth: StyleSheet.hairlineWidth,
        padding: 18,
        gap: 16,
    },
    header: {
        gap: 4,
    },
    title: {
        lineHeight: 32,
    },
    description: {
        fontSize: 15,
        lineHeight: 20,
    },
    segmentRow: {
        flexDirection: "row",
        gap: 8,
    },
    segment: {
        flex: 1,
        minHeight: 40,
        borderRadius: 12,
        borderWidth: StyleSheet.hairlineWidth,
        alignItems: "center",
        justifyContent: "center",
    },
    segmentText: {
        fontSize: 15,
        fontWeight: "600",
    },
    fieldGroup: {
        gap: 10,
    },
    input: {
        minHeight: 52,
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
    },
    errorText: {
        fontSize: 14,
        lineHeight: 18,
        color: "#FF3B30",
    },
    footnote: {
        fontSize: 13,
        lineHeight: 18,
    },
});
