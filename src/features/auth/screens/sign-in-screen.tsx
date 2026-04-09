import { ThemedText } from "@/components/themed-text";
import { ActionGroup, ActionLink, BackAction, BulletList, ScreenShell, SectionCard } from "@/src/ui/screen-shell";

export function SignInScreen() {
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
                    <ActionLink href="/appointments" label="Enter customer area" />
                </ActionGroup>
            </SectionCard>

            <SectionCard title="What this flow needs">
                <BulletList
                    items={[
                        "Better Auth Expo integration.",
                        "Secure session persistence with expo-secure-store.",
                        "A native request wrapper that preserves authenticated session behavior.",
                    ]}
                />
            </SectionCard>

            <SectionCard title="Return targets">
                <ThemedText>
                    After successful sign-in, the app should return the user to the interrupted booking flow instead of
                    dropping them on a generic home screen.
                </ThemedText>
                <ActionLink href="/appointments" label="Open customer appointments" variant="secondary" />
            </SectionCard>
        </ScreenShell>
    );
}
