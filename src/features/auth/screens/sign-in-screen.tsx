import { useState } from "react";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { StyleSheet, TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useAuthSession } from "@/features/auth/session-provider";
import { ActionButton, ActionGroup, ActionLink, BackAction, ScreenShell, SectionCard } from "@/ui/screen-shell";

export function SignInScreen() {
    const router = useRouter();
    const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
    const { signIn } = useAuthSession();
    const safeReturnTo: Href = returnTo && returnTo.startsWith("/") ? (returnTo as Href) : ("/" as Href);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const bookingFallbackHref: Href =
        safeReturnTo.toString().startsWith("/booking/") || safeReturnTo.toString().startsWith("/(public)/booking/")
            ? safeReturnTo
            : "/";

    return (
        <ScreenShell title="Sign in">
            <SectionCard title="Actions">
                <ActionGroup>
                    <BackAction label="Back to discovery" fallbackHref="/" />
                    <BackAction label="Return to booking" fallbackHref={bookingFallbackHref} />
                    <ActionButton
                        label={isSubmitting ? "Signing in…" : "Sign in"}
                        onPress={async () => {
                            const trimmedEmail = email.trim();

                            if (!trimmedEmail || !password) {
                                setErrorMessage("Email and password are required.");
                                return;
                            }

                            setIsSubmitting(true);
                            setErrorMessage(null);

                            const error = await signIn({
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

            <SectionCard title="Email and password">
                <View style={styles.fieldGroup}>
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
                <ActionLink href={safeReturnTo} label="Preview post-sign-in target" variant="secondary" />
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
