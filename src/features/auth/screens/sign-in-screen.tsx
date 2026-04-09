import { useState } from "react";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { StyleSheet, TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useAuthSession } from "@/features/auth/session-provider";
import { ActionButton, ActionGroup, ActionLink, BackAction, BulletList, ScreenShell, SectionCard } from "@/ui/screen-shell";

export function SignInScreen() {
    const router = useRouter();
    const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
    const { signIn } = useAuthSession();
    const safeReturnTo: Href = returnTo && returnTo.startsWith("/") ? (returnTo as Href) : "/appointments";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    return (
        <ScreenShell
            eyebrow="Authentication"
            title="Sign in before booking"
            description="This is the auth boundary from the user stories: browsing remains public, while creating and managing appointments requires an authenticated customer."
        >
            <SectionCard title="Quick navigation">
                <ActionGroup>
                    <BackAction label="Back to discovery" fallbackHref="/" />
                    <BackAction label="Return to booking" fallbackHref="/booking/barber-house" />
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

            <SectionCard title="What this flow needs">
                <BulletList
                    items={[
                        "Better Auth email/password sign-in against the live backend.",
                        "Secure session persistence with expo-secure-store.",
                        "Cookie-backed authenticated requests from the native client.",
                    ]}
                />
            </SectionCard>

            <SectionCard title="Return targets">
                <ThemedText>
                    After successful sign-in, the app should return the user to the interrupted booking flow instead of
                    dropping them on a generic home screen.
                </ThemedText>
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
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(10, 126, 164, 0.35)",
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: "rgba(247, 248, 250, 0.9)",
    },
});
