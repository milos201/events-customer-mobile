import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useAuthSession } from "@/features/auth/session-provider";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Radius, Shadows, Spacing, Typography } from "@/theme";
import { ActionButton } from "@/ui/screen-shell";

export function SignInScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { returnTo, mode } = useLocalSearchParams<{ returnTo?: string; mode?: string }>();
    const { status, signIn, createAccount } = useAuthSession();
    const safeReturnTo: Href = returnTo?.startsWith("/") ? (returnTo as Href) : ("/" as Href);
    const [authMode, setAuthMode] = useState<"sign-in" | "create-account">(
        mode === "create-account" ? "create-account" : "sign-in",
    );
    const isCreateAccount = authMode === "create-account";
    const theme = useAppTheme();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const bookingFallbackHref: Href = safeReturnTo.toString().startsWith("/booking/") ? safeReturnTo : "/";

    function dismiss() {
        if (router.canGoBack()) {
            router.back();
            return;
        }

        router.replace(bookingFallbackHref);
    }

    useEffect(() => {
        if (status !== "authenticated" || isSubmitting) {
            return;
        }

        if (router.canGoBack()) {
            router.back();
            return;
        }

        router.replace(safeReturnTo);
    }, [isSubmitting, router, safeReturnTo, status]);

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
                            <ThemedText style={[styles.dismissText, { color: theme.textMuted }]}>Not now</ThemedText>
                        </Pressable>
                    </View>

                    <ThemedView
                        style={[
                            styles.sheet,
                            {
                                ...Shadows.floating,
                                backgroundColor: theme.surfaceElevated,
                                borderColor: theme.border,
                            },
                        ]}
                    >
                        <View style={styles.header}>
                            <ThemedText type="title" style={styles.title}>
                                {isCreateAccount ? "Create account" : "Sign in"}
                            </ThemedText>
                            <ThemedText style={[styles.description, { color: theme.textMuted }]}>
                                {isCreateAccount
                                    ? "Create an account and continue where you left off."
                                    : "Continue to your bookings and appointments."}
                            </ThemedText>
                        </View>

                        <SegmentedControl
                            value={authMode}
                            onChange={(nextMode) => {
                                setAuthMode(nextMode);
                                setErrorMessage(null);
                            }}
                            options={[
                                { value: "sign-in", label: "Sign in" },
                                { value: "create-account", label: "Create account" },
                            ]}
                        />

                        <View style={styles.fieldGroup}>
                            {isCreateAccount ? (
                                <TextInput
                                    autoCapitalize="words"
                                    autoComplete="name"
                                    onChangeText={setName}
                                    placeholder="Your name"
                                    placeholderTextColor={theme.textSubtle}
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor: theme.surface,
                                            borderColor: theme.border,
                                            color: theme.text,
                                        },
                                    ]}
                                    value={name}
                                />
                            ) : null}
                            <TextInput
                                autoCapitalize="none"
                                autoComplete="email"
                                keyboardType="email-address"
                                onChangeText={setEmail}
                                placeholder="customer@example.com"
                                placeholderTextColor={theme.textSubtle}
                                style={[
                                    styles.input,
                                    { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text },
                                ]}
                                value={email}
                            />
                            <TextInput
                                autoCapitalize="none"
                                autoComplete="password"
                                onChangeText={setPassword}
                                placeholder="Password"
                                placeholderTextColor={theme.textSubtle}
                                secureTextEntry
                                style={[
                                    styles.input,
                                    { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text },
                                ]}
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
                                    setErrorMessage(
                                        isCreateAccount
                                            ? "Name, email, and password are required."
                                            : "Email and password are required.",
                                    );
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
                            }}
                        />

                        <ThemedText style={[styles.footnote, { color: theme.textMuted }]}>
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
        paddingHorizontal: Spacing.md,
        justifyContent: "flex-end",
        gap: Spacing.md,
    },
    topBar: {
        alignItems: "flex-end",
    },
    dismissText: {
        fontSize: 16,
        lineHeight: 20,
    },
    sheet: {
        borderRadius: Radius.xl,
        borderWidth: StyleSheet.hairlineWidth,
        padding: 18,
        gap: Spacing.md,
    },
    header: {
        gap: 4,
    },
    title: {
        lineHeight: 32,
    },
    description: {
        ...Typography.bodySm,
    },
    fieldGroup: {
        gap: Spacing.sm,
    },
    input: {
        minHeight: 52,
        borderRadius: Radius.md,
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
        ...Typography.label,
        fontWeight: "400",
    },
});
