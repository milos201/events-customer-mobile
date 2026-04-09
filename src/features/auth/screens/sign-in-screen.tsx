import { useState } from "react";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { StyleSheet, TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useAuthSession } from "@/features/auth/session-provider";
import { ActionButton, ActionGroup, ActionLink, BackAction, ScreenShell, SectionCard } from "@/ui/screen-shell";

export function SignInScreen() {
    const router = useRouter();
    const { returnTo, mode } = useLocalSearchParams<{ returnTo?: string; mode?: string }>();
    const { signIn, createAccount } = useAuthSession();
    const safeReturnTo: Href = returnTo && returnTo.startsWith("/") ? (returnTo as Href) : ("/" as Href);
    const isCreateAccount = mode === "create-account";
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const bookingFallbackHref: Href =
        safeReturnTo.toString().startsWith("/booking/") || safeReturnTo.toString().startsWith("/(public)/booking/")
            ? safeReturnTo
            : "/";

    return (
        <ScreenShell
            title={isCreateAccount ? "Create account" : "Sign in"}
            description={isCreateAccount ? "Create an account and continue where you left off." : "Continue to your appointments and bookings."}
        >
            <SectionCard title="Actions">
                <ActionGroup>
                    <BackAction label="Not now" fallbackHref={bookingFallbackHref} />
                    <ActionLink
                        href={{
                            pathname: "/sign-in",
                            params: {
                                returnTo: String(safeReturnTo),
                                ...(isCreateAccount ? {} : { mode: "create-account" }),
                            },
                        } as unknown as Href}
                        label={isCreateAccount ? "I already have an account" : "Create account"}
                        variant="secondary"
                    />
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
                </ActionGroup>
            </SectionCard>

            <SectionCard title={isCreateAccount ? "Profile and password" : "Email and password"}>
                <View style={styles.fieldGroup}>
                    {isCreateAccount ? (
                        <TextInput
                            autoCapitalize="words"
                            autoComplete="name"
                            onChangeText={setName}
                            placeholder="Your name"
                            style={styles.input}
                            value={name}
                        />
                    ) : null}
                    <TextInput
                        autoCapitalize="none"
                        autoComplete="email"
                        keyboardType="email-address"
                        onChangeText={setEmail}
                        placeholder="customer@example.com"
                        style={styles.input}
                        value={email}
                    />
                    <TextInput
                        autoCapitalize="none"
                        autoComplete="password"
                        onChangeText={setPassword}
                        placeholder="Password"
                        secureTextEntry
                        style={styles.input}
                        value={password}
                    />
                </View>
                {errorMessage ? <ThemedText>{errorMessage}</ThemedText> : null}
            </SectionCard>

            <SectionCard title="Continue">
                <ActionLink href={safeReturnTo} label="Preview return target" variant="secondary" />
            </SectionCard>
        </ScreenShell>
    );
}

const styles = StyleSheet.create({
    fieldGroup: {
        gap: 12,
    },
    input: {
        minHeight: 52,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(60, 60, 67, 0.2)",
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: "#FFFFFF",
    },
});
