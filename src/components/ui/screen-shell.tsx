import { BottomTabBarHeightContext } from "@react-navigation/bottom-tabs";
import { type Href, Link } from "expo-router";
import { type PropsWithChildren, type ReactNode, useContext } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Fonts, Radius, Shadows, Spacing, Typography } from "@/theme";

type ScreenShellLayout = "default" | "detail" | "compact";
type ScreenShellInsetMode = "safe" | "none";
type ScreenShellSpacing = keyof typeof Spacing;

type ScreenShellProps = PropsWithChildren<{
    eyebrow?: string;
    title: ReactNode;
    description?: string;
    showHero?: boolean;
    layout?: ScreenShellLayout;
    topInset?: ScreenShellInsetMode;
    bottomInset?: ScreenShellInsetMode;
    horizontalPadding?: ScreenShellSpacing;
    topPadding?: ScreenShellSpacing;
    bottomPadding?: ScreenShellSpacing;
    contentGap?: ScreenShellSpacing;
}>;

type ActionLinkProps = {
    href: Href;
    label: string;
    variant?: "primary" | "secondary";
    trailing?: ReactNode;
};

type ActionGroupProps = PropsWithChildren;

type ActionButtonProps = {
    label: string;
    onPress: () => void;
    variant?: "primary" | "secondary";
    trailing?: ReactNode;
};

const SCREEN_SHELL_LAYOUTS: Record<
    ScreenShellLayout,
    {
        horizontalPadding: ScreenShellSpacing;
        topPadding: ScreenShellSpacing;
        bottomPadding: ScreenShellSpacing;
        contentGap: ScreenShellSpacing;
    }
> = {
    default: {
        horizontalPadding: "md",
        topPadding: "xs",
        bottomPadding: "xl",
        contentGap: "lg",
    },
    detail: {
        horizontalPadding: "md",
        topPadding: "xs",
        bottomPadding: "xl",
        contentGap: "md",
    },
    compact: {
        horizontalPadding: "md",
        topPadding: "xs",
        bottomPadding: "lg",
        contentGap: "md",
    },
};

export function ScreenShell({
    eyebrow,
    title,
    description,
    children,
    showHero = true,
    layout = "default",
    topInset = "safe",
    bottomInset = "safe",
    horizontalPadding,
    topPadding,
    bottomPadding,
    contentGap,
}: ScreenShellProps) {
    const insets = useSafeAreaInsets();
    const theme = useAppTheme();
    const bottomTabBarHeight = useContext(BottomTabBarHeightContext) ?? 0;
    const layoutConfig = SCREEN_SHELL_LAYOUTS[layout];
    const resolvedHorizontalPadding = Spacing[horizontalPadding ?? layoutConfig.horizontalPadding];
    const resolvedTopPadding = Spacing[topPadding ?? layoutConfig.topPadding];
    const resolvedBottomPadding = Spacing[bottomPadding ?? layoutConfig.bottomPadding];
    const resolvedContentGap = Spacing[contentGap ?? layoutConfig.contentGap];
    const contentPaddingTop = (topInset === "safe" ? insets.top : 0) + resolvedTopPadding;
    const contentPaddingBottom =
        (bottomInset === "safe" ? insets.bottom : 0) + resolvedBottomPadding + bottomTabBarHeight;

    return (
        <ThemedView style={[styles.screen, { backgroundColor: theme.backgroundCanvas }]}>
            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    {
                        paddingTop: contentPaddingTop,
                        paddingBottom: contentPaddingBottom,
                        paddingHorizontal: resolvedHorizontalPadding,
                        gap: resolvedContentGap,
                    },
                ]}
            >
                {showHero ? (
                    <View style={styles.hero}>
                        {eyebrow ? (
                            <ThemedText style={[styles.eyebrow, { color: theme.textSubtle }]}>{eyebrow}</ThemedText>
                        ) : null}
                        {typeof title === "string" ? (
                            <ThemedText type="title" style={styles.title}>
                                {title}
                            </ThemedText>
                        ) : (
                            title
                        )}
                        {description ? (
                            <ThemedText style={[styles.description, { color: theme.textMuted }]}>
                                {description}
                            </ThemedText>
                        ) : null}
                    </View>
                ) : null}
                <View style={[styles.stack, { gap: resolvedContentGap }]}>{children}</View>
            </ScrollView>
        </ThemedView>
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

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    content: {},
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
    stack: {},
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
