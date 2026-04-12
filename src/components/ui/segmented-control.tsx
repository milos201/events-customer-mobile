import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Fonts, Radius, Shadows, Spacing, Typography } from "@/theme";

type SegmentedControlOption<T extends string> = {
    value: T;
    label: string;
    badge?: ReactNode;
};

type SegmentedControlProps<T extends string> = {
    options: readonly SegmentedControlOption<T>[];
    value: T;
    onChange: (value: T) => void;
    size?: "sm" | "lg";
    shadowed?: boolean;
};

export function SegmentedControl<T extends string>({
    options,
    value,
    onChange,
    size = "sm",
    shadowed = false,
}: SegmentedControlProps<T>) {
    const theme = useAppTheme();
    const sizeStyles = size === "lg" ? LARGE_SIZE_STYLES : SMALL_SIZE_STYLES;

    return (
        <View
            style={[
                styles.row,
                styles.surfaceRow,
                shadowed ? Shadows.card : null,
                { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
        >
            {options.map((option) => {
                const isSelected = option.value === value;

                return (
                    <Pressable
                        key={option.value}
                        onPress={() => onChange(option.value)}
                        style={[
                            styles.segment,
                            sizeStyles.segment,
                            isSelected ? styles.surfaceSegmentActive : styles.surfaceSegmentIdle,
                            shadowed && isSelected ? Shadows.card : null,
                            {
                                backgroundColor: isSelected ? theme.tint : "transparent",
                                borderColor: isSelected ? theme.tint : "transparent",
                            },
                        ]}
                    >
                        <View style={styles.segmentContent}>
                            <ThemedText
                                style={[
                                    styles.label,
                                    sizeStyles.label,
                                    {
                                        color: isSelected ? theme.tintForeground : theme.textMuted,
                                    },
                                ]}
                            >
                                {option.label}
                            </ThemedText>
                            {option.badge}
                        </View>
                    </Pressable>
                );
            })}
        </View>
    );
}

const SMALL_SIZE_STYLES = StyleSheet.create({
    segment: {
        minHeight: 42,
        borderRadius: Radius.md,
    },
    label: {
        fontSize: 15,
        lineHeight: 18,
    },
});

const LARGE_SIZE_STYLES = StyleSheet.create({
    segment: {
        minHeight: 52,
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.md,
    },
    label: {
        fontSize: 16,
        lineHeight: 20,
    },
});

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        gap: Spacing.xs,
    },
    surfaceRow: {
        borderRadius: Radius.xl,
        borderWidth: StyleSheet.hairlineWidth,
        padding: 6,
    },
    segment: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    surfaceSegmentActive: {
        borderWidth: StyleSheet.hairlineWidth,
    },
    surfaceSegmentIdle: {
        backgroundColor: "transparent",
    },
    segmentContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.xs,
    },
    label: {
        fontWeight: "600",
        fontFamily: Fonts.sans,
    },
    badgeText: {
        ...Typography.label,
        fontFamily: Fonts.sans,
    },
    countBadge: {
        minWidth: 22,
        height: 22,
        borderRadius: Radius.full,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 6,
    },
});

type CountBadgeProps = {
    count: number;
};

export function SegmentedControlCountBadge({ count }: CountBadgeProps) {
    const theme = useAppTheme();

    if (count === 0) {
        return null;
    }

    return (
        <View style={[styles.countBadge, { backgroundColor: theme.tintMuted }]}>
            <ThemedText style={[styles.badgeText, { color: theme.tint }]}>{count}</ThemedText>
        </View>
    );
}
