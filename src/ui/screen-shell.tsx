import { type Href, Link, useRouter } from "expo-router";
import type { PropsWithChildren, ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Fonts } from "@/constants/theme";

type ScreenShellProps = PropsWithChildren<{
    eyebrow?: string;
    title: string;
    description?: string;
    showHero?: boolean;
}>;

type SectionCardProps = PropsWithChildren<{
    title: string;
}>;

type ListProps = {
    items: string[];
};

type ActionLinkProps = {
    href: Href;
    label: string;
    variant?: "primary" | "secondary";
    trailing?: ReactNode;
};

type ActionGroupProps = PropsWithChildren;

type BackActionProps = {
    label: string;
    fallbackHref: Href;
    variant?: "primary" | "secondary";
};

type ActionButtonProps = {
    label: string;
    onPress: () => void;
    variant?: "primary" | "secondary";
    trailing?: ReactNode;
};

export function ScreenShell({ eyebrow, title, description, children, showHero = true }: ScreenShellProps) {
    const insets = useSafeAreaInsets();
    const contentPaddingTop = showHero ? insets.top + 8 : 8;

    return (
        <ThemedView style={styles.screen}>
            <ScrollView contentContainerStyle={[styles.content, { paddingTop: contentPaddingTop, paddingBottom: insets.bottom + 24 }]}>
                {showHero ? (
                    <View style={styles.hero}>
                        {eyebrow ? <ThemedText style={styles.eyebrow}>{eyebrow}</ThemedText> : null}
                        <ThemedText type="title" style={styles.title}>
                            {title}
                        </ThemedText>
                        {description ? <ThemedText style={styles.description}>{description}</ThemedText> : null}
                    </View>
                ) : null}
                <View style={styles.stack}>{children}</View>
            </ScrollView>
        </ThemedView>
    );
}

export function SectionCard({ title, children }: SectionCardProps) {
    return (
        <ThemedView style={styles.card} lightColor="#FFFFFF" darkColor="#151718">
            <ThemedText type="subtitle" style={styles.cardTitle}>
                {title}
            </ThemedText>
            <View style={styles.stackSm}>{children}</View>
        </ThemedView>
    );
}

export function BulletList({ items }: ListProps) {
    return (
        <View style={styles.stackXs}>
            {items.map((item) => (
                <View key={item} style={styles.bulletRow}>
                    <View style={styles.bullet} />
                    <ThemedText style={styles.bulletText}>{item}</ThemedText>
                </View>
            ))}
        </View>
    );
}

export function ActionLink({ href, label, variant = "primary", trailing }: ActionLinkProps) {
    const secondaryTextColor = useThemeColor({}, "text");

    return (
        <Link href={href} asChild>
            <Pressable style={[styles.action, variant === "secondary" ? styles.actionSecondary : styles.actionPrimary]}>
                <ThemedText
                    style={[
                        styles.actionText,
                        variant === "secondary" ? { color: secondaryTextColor } : null,
                    ]}
                >
                    {label}
                </ThemedText>
                {trailing}
            </Pressable>
        </Link>
    );
}

export function ActionGroup({ children }: ActionGroupProps) {
    return <View style={styles.actionGroup}>{children}</View>;
}

export function ActionButton({ label, onPress, variant = "primary", trailing }: ActionButtonProps) {
    const secondaryTextColor = useThemeColor({}, "text");

    return (
        <Pressable
            style={[styles.action, variant === "secondary" ? styles.actionSecondary : styles.actionPrimary]}
            onPress={onPress}
        >
            <ThemedText
                style={[
                    styles.actionText,
                    variant === "secondary" ? { color: secondaryTextColor } : null,
                ]}
            >
                {label}
            </ThemedText>
            {trailing}
        </Pressable>
    );
}

export function BackAction({ label, fallbackHref, variant = "secondary" }: BackActionProps) {
    const router = useRouter();
    const secondaryTextColor = useThemeColor({}, "text");

    return (
        <Pressable
            style={[styles.action, variant === "secondary" ? styles.actionSecondary : styles.actionPrimary]}
            onPress={() => {
                if (router.canGoBack()) {
                    router.back();
                    return;
                }

                router.replace(fallbackHref);
            }}
        >
            <ThemedText
                style={[
                    styles.actionText,
                    variant === "secondary" ? { color: secondaryTextColor } : null,
                ]}
            >
                {label}
            </ThemedText>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 16,
        gap: 14,
    },
    hero: {
        gap: 2,
    },
    eyebrow: {
        fontSize: 12,
        opacity: 0.55,
    },
    title: {
        lineHeight: 34,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        opacity: 0.72,
    },
    stack: {
        gap: 12,
    },
    stackSm: {
        gap: 10,
    },
    stackXs: {
        gap: 8,
    },
    card: {
        borderRadius: 14,
        padding: 14,
        gap: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(60, 60, 67, 0.18)",
    },
    cardTitle: {
        fontFamily: Fonts.sans,
        fontSize: 17,
        fontWeight: "600",
    },
    bulletRow: {
        flexDirection: "row",
        gap: 8,
        alignItems: "flex-start",
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 999,
        backgroundColor: "#8E8E93",
        marginTop: 8,
    },
    bulletText: {
        flex: 1,
    },
    action: {
        minHeight: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row",
    },
    actionGroup: {
        gap: 8,
    },
    actionPrimary: {
        backgroundColor: "#0A84FF",
    },
    actionSecondary: {
        borderWidth: 1,
        borderColor: "rgba(60, 60, 67, 0.2)",
    },
    actionText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "500",
    },
});
