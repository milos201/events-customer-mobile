import { Platform, type ViewStyle } from "react-native";

const amberAccent = "#9C4F19";
const amberAccentDark = "#C9753A";

export const Colors = {
    light: {
        text: "#231A14",
        textMuted: "#75685E",
        textSubtle: "#96877A",
        background: "#F7F1EA",
        backgroundCanvas: "#F2E8DC",
        surface: "#FFFCF8",
        surfaceMuted: "#F6EEE5",
        surfaceElevated: "#FFFFFF",
        tint: amberAccent,
        tintMuted: "#E8D2BF",
        tintForeground: "#FFF9F3",
        icon: "#7A6E64",
        border: "#E7DDD2",
        borderStrong: "#D8C6B6",
        tabIconDefault: "#8C7D70",
        tabIconSelected: amberAccent,
        success: "#12805C",
        successSurface: "#DFF5EA",
        warning: "#A66A00",
        warningSurface: "#FBECC8",
        danger: "#B34242",
        dangerSurface: "#F9E0DE",
        shadow: "rgba(83, 55, 31, 0.12)",
        mapOverlay: "rgba(255, 252, 248, 0.88)",
    },
    dark: {
        text: "#F5EEE8",
        textMuted: "#C5B7AA",
        textSubtle: "#A59588",
        background: "#1B1511",
        backgroundCanvas: "#231B16",
        surface: "#261E19",
        surfaceMuted: "#2F251F",
        surfaceElevated: "#342821",
        tint: amberAccentDark,
        tintMuted: "#563721",
        tintForeground: "#FFF4EC",
        icon: "#BBAA9C",
        border: "#4C3A2D",
        borderStrong: "#6A503C",
        tabIconDefault: "#AE9C8E",
        tabIconSelected: amberAccentDark,
        success: "#74D1A7",
        successSurface: "rgba(18, 128, 92, 0.18)",
        warning: "#F0BF65",
        warningSurface: "rgba(166, 106, 0, 0.22)",
        danger: "#F0A7A4",
        dangerSurface: "rgba(179, 66, 66, 0.22)",
        shadow: "rgba(0, 0, 0, 0.28)",
        mapOverlay: "rgba(38, 30, 25, 0.9)",
    },
} as const;

export type ThemeColors = (typeof Colors)["light"];
export type ThemeColorName = keyof ThemeColors;

export const Fonts = Platform.select({
    ios: {
        sans: "system-ui",
        serif: "ui-serif",
        rounded: "ui-rounded",
        mono: "ui-monospace",
    },
    default: {
        sans: "normal",
        serif: "serif",
        rounded: "normal",
        mono: "monospace",
    },
    web: {
        sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        serif: "Georgia, 'Times New Roman', serif",
        rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
        mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
});

export const Spacing = {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
} as const;

export const Radius = {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 28,
    full: 999,
} as const;

export const Typography = {
    body: {
        fontSize: 16,
        lineHeight: 24,
    },
    bodySm: {
        fontSize: 14,
        lineHeight: 20,
    },
    label: {
        fontSize: 13,
        lineHeight: 18,
        fontWeight: "600" as const,
        letterSpacing: 0.2,
    },
    title: {
        fontSize: 34,
        lineHeight: 38,
        fontWeight: "700" as const,
    },
    subtitle: {
        fontSize: 22,
        lineHeight: 28,
        fontWeight: "700" as const,
    },
    sectionEyebrow: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: "700" as const,
        letterSpacing: 0.9,
        textTransform: "uppercase" as const,
    },
} as const;

export const Shadows: Record<"card" | "floating", ViewStyle> = Platform.select({
    ios: {
        card: {
            shadowColor: "#53371F",
            shadowOpacity: 0.12,
            shadowRadius: 18,
            shadowOffset: {
                width: 0,
                height: 8,
            },
        },
        floating: {
            shadowColor: "#53371F",
            shadowOpacity: 0.16,
            shadowRadius: 20,
            shadowOffset: {
                width: 0,
                height: 10,
            },
        },
    },
    default: {
        card: {
            elevation: 3,
        },
        floating: {
            elevation: 5,
        },
    },
    web: {
        card: {
            boxShadow: "0px 10px 24px rgba(83, 55, 31, 0.08)",
        } as ViewStyle,
        floating: {
            boxShadow: "0px 14px 28px rgba(83, 55, 31, 0.12)",
        } as ViewStyle,
    },
}) as Record<"card" | "floating", ViewStyle>;
