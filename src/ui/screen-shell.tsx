import { type Href, Link, useRouter } from "expo-router";
import type { PropsWithChildren, ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Fonts, Radius, Shadows, Spacing, Typography } from "@/theme";

type ScreenShellProps = PropsWithChildren<{
    eyebrow?: string;
    title: ReactNode;
    description?: string;
    showHero?: boolean;
    includeTopInset?: boolean;
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

export function ScreenShell({
    eyebrow,
    title,
    description,
    children,
    showHero = true,
    includeTopInset = true,
}: ScreenShellProps) {
    const insets = useSafeAreaInsets();
    const theme = useAppTheme();
    const contentPaddingTop = showHero ? (includeTopInset ? insets.top + 8 : 8) : 8;

    return (
        <ThemedView style={[styles.screen, { backgroundColor: theme.backgroundCanvas }]}>
            <ScrollView contentContainerStyle={[styles.content, { paddingTop: contentPaddingTop, paddingBottom: insets.bottom + 24 }]}>
                {showHero ? (
                    <View style={styles.hero}>
                        {eyebrow ? <ThemedText style={[styles.eyebrow, { color: theme.textSubtle }]}>{eyebrow}</ThemedText> : null}
                        {typeof title === "string" ? (
                            <ThemedText type="title" style={styles.title}>
                                {title}
                            </ThemedText>
                        ) : (
                            title
                        )}
                        {description ? <ThemedText style={[styles.description, { color: theme.textMuted }]}>{description}</ThemedText> : null}
                    </View>
                ) : null}
                <View style={styles.stack}>{children}</View>
            </ScrollView>
        </ThemedView>
    );
}

export function SectionCard({ title, children }: SectionCardProps) {
    const theme = useAppTheme();

    return (
        <ThemedView style={[styles.card, Shadows.card, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]} lightColor={theme.surfaceElevated} darkColor={theme.surfaceElevated}>
            <ThemedText type="subtitle" style={[styles.cardTitle, { color: theme.textMuted }]}>
                {title}
            </ThemedText>
            <View style={styles.stackSm}>{children}</View>
        </ThemedView>
    );
}

export function BulletList({ items }: ListProps) {
    const theme = useAppTheme();

    return (
        <View style={styles.stackXs}>
            {items.map((item) => (
                <View key={item} style={styles.bulletRow}>
                    <View style={[styles.bullet, { backgroundColor: theme.tint }]} />
                    <ThemedText style={[styles.bulletText, { color: theme.textMuted }]}>{item}</ThemedText>
                </View>
            ))}
        </View>
    );
}

export function ActionLink({ href, label, variant = "primary", trailing }: ActionLinkProps) {
    const theme = useAppTheme();
    const secondaryTextColor = useThemeColor({}, "text");

    return (
        <Link href={href} asChild>
            <Pressable
                style={[
                    styles.action,
                    Shadows.card,
                    variant === "secondary"
                        ? [styles.actionSecondary, { backgroundColor: theme.surface, borderColor: theme.border }]
                        : [styles.actionPrimary, { backgroundColor: theme.tint }],
                ]}
            >
                <ThemedText
                    style={[
                        styles.actionText,
                        variant === "secondary" ? { color: secondaryTextColor } : { color: theme.tintForeground },
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
    const theme = useAppTheme();
    const secondaryTextColor = useThemeColor({}, "text");

    return (
        <Pressable
            style={[
                styles.action,
                Shadows.card,
                variant === "secondary"
                    ? [styles.actionSecondary, { backgroundColor: theme.surface, borderColor: theme.border }]
                    : [styles.actionPrimary, { backgroundColor: theme.tint }],
            ]}
            onPress={onPress}
        >
            <ThemedText
                style={[
                    styles.actionText,
                    variant === "secondary" ? { color: secondaryTextColor } : { color: theme.tintForeground },
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
    const theme = useAppTheme();
    const secondaryTextColor = useThemeColor({}, "text");

    return (
        <Pressable
            style={[
                styles.action,
                Shadows.card,
                variant === "secondary"
                    ? [styles.actionSecondary, { backgroundColor: theme.surface, borderColor: theme.border }]
                    : [styles.actionPrimary, { backgroundColor: theme.tint }],
            ]}
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
                    variant === "secondary" ? { color: secondaryTextColor } : { color: theme.tintForeground },
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
        paddingHorizontal: Spacing.md,
        gap: Spacing.lg,
    },
    hero: {
        gap: Spacing.xs,
        paddingBottom: Spacing.xs,
    },
    eyebrow: {
        ...Typography.sectionEyebrow,
        fontFamily: Fonts.sans,
    },
    title: {
        lineHeight: 40,
    },
    description: {
        ...Typography.bodySm,
        fontFamily: Fonts.sans,
    },
    stack: {
        gap: Spacing.md,
    },
    stackSm: {
        gap: Spacing.sm,
    },
    stackXs: {
        gap: Spacing.xs,
    },
    card: {
        borderRadius: Radius.lg,
        padding: Spacing.md,
        gap: Spacing.sm,
        borderWidth: StyleSheet.hairlineWidth,
    },
    cardTitle: {
        fontFamily: Fonts.sans,
        ...Typography.sectionEyebrow,
        fontWeight: "600",
    },
    bulletRow: {
        flexDirection: "row",
        gap: Spacing.xs,
        alignItems: "flex-start",
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 999,
        marginTop: 8,
    },
    bulletText: {
        flex: 1,
    },
    action: {
        minHeight: 56,
        borderRadius: Radius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row",
        borderWidth: StyleSheet.hairlineWidth,
    },
    actionGroup: {
        gap: Spacing.xs,
    },
    actionPrimary: {},
    actionSecondary: {
        borderWidth: StyleSheet.hairlineWidth,
    },
    actionText: {
        fontSize: 16,
        fontWeight: "500",
        fontFamily: Fonts.sans,
    },
});
