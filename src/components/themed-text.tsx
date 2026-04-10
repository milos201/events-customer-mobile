import { StyleSheet, Text, type TextProps } from "react-native";

import { useThemeColor } from "@/hooks/use-theme-color";
import { Fonts, Typography } from "@/theme";

export type ThemedTextProps = TextProps & {
    lightColor?: string;
    darkColor?: string;
    type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

export function ThemedText({ style, lightColor, darkColor, type = "default", ...rest }: ThemedTextProps) {
    const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

    return (
        <Text
            style={[
                { color },
                type === "default" ? styles.default : undefined,
                type === "title" ? styles.title : undefined,
                type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
                type === "subtitle" ? styles.subtitle : undefined,
                type === "link" ? styles.link : undefined,
                style,
            ]}
            {...rest}
        />
    );
}

const styles = StyleSheet.create({
    default: {
        ...Typography.body,
        fontFamily: Fonts.sans,
    },
    defaultSemiBold: {
        ...Typography.body,
        fontFamily: Fonts.sans,
        fontWeight: "600",
    },
    title: {
        ...Typography.title,
        fontFamily: Fonts.sans,
    },
    subtitle: {
        ...Typography.subtitle,
        fontFamily: Fonts.sans,
    },
    link: {
        ...Typography.body,
        fontFamily: Fonts.sans,
        color: "#9C4F19",
        fontWeight: "600",
    },
});
