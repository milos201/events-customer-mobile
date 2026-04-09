import { type Href, Link, useRouter } from "expo-router";
import type { PropsWithChildren, ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";

type ScreenShellProps = PropsWithChildren<{
    eyebrow: string;
    title: string;
    description: string;
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

export function ScreenShell({ eyebrow, title, description, children }: ScreenShellProps) {
    return (
        <ThemedView style={styles.screen}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.hero}>
                    <ThemedText style={styles.eyebrow}>{eyebrow}</ThemedText>
                    <ThemedText type="title" style={styles.title}>
                        {title}
                    </ThemedText>
                    <ThemedText style={styles.description}>{description}</ThemedText>
                </View>
                <View style={styles.stack}>{children}</View>
            </ScrollView>
        </ThemedView>
    );
}

export function SectionCard({ title, children }: SectionCardProps) {
    return (
        <ThemedView style={styles.card} lightColor="#F7F8FA" darkColor="#1C1F24">
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
    return (
        <Link href={href} asChild>
            <Pressable style={[styles.action, variant === "secondary" ? styles.actionSecondary : styles.actionPrimary]}>
                <ThemedText style={[styles.actionText, variant === "secondary" ? styles.actionTextSecondary : null]}>
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
    return (
        <Pressable
            style={[styles.action, variant === "secondary" ? styles.actionSecondary : styles.actionPrimary]}
            onPress={onPress}
        >
            <ThemedText style={[styles.actionText, variant === "secondary" ? styles.actionTextSecondary : null]}>
                {label}
            </ThemedText>
            {trailing}
        </Pressable>
    );
}

export function BackAction({ label, fallbackHref, variant = "secondary" }: BackActionProps) {
    const router = useRouter();

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
            <ThemedText style={[styles.actionText, variant === "secondary" ? styles.actionTextSecondary : null]}>
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
        padding: 24,
        paddingTop: 72,
        paddingBottom: 120,
        gap: 20,
    },
    hero: {
        gap: 10,
    },
    eyebrow: {
        fontFamily: Fonts.mono,
        fontSize: 13,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        opacity: 0.7,
    },
    title: {
        lineHeight: 38,
    },
    description: {
        fontSize: 17,
        lineHeight: 26,
        opacity: 0.8,
    },
    stack: {
        gap: 16,
    },
    stackSm: {
        gap: 12,
    },
    stackXs: {
        gap: 10,
    },
    card: {
        borderRadius: 24,
        padding: 18,
        gap: 12,
    },
    cardTitle: {
        fontFamily: Fonts.rounded,
    },
    bulletRow: {
        flexDirection: "row",
        gap: 10,
        alignItems: "flex-start",
    },
    bullet: {
        width: 8,
        height: 8,
        borderRadius: 999,
        backgroundColor: "#0A7EA4",
        marginTop: 8,
    },
    bulletText: {
        flex: 1,
    },
    action: {
        minHeight: 54,
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row",
    },
    actionGroup: {
        gap: 10,
    },
    actionPrimary: {
        backgroundColor: "#0A7EA4",
    },
    actionSecondary: {
        borderWidth: 1,
        borderColor: "rgba(10, 126, 164, 0.35)",
    },
    actionText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    actionTextSecondary: {
        color: "#0A7EA4",
    },
});
