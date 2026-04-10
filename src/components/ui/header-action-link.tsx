import { type Href, Link } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";

type HeaderActionLinkProps = {
    href: Href;
    label: string;
};

export function HeaderActionLink({ href, label }: HeaderActionLinkProps) {
    return (
        <Link href={href} asChild>
            <Pressable hitSlop={8} style={styles.action}>
                <ThemedText style={styles.label}>{label}</ThemedText>
            </Pressable>
        </Link>
    );
}

const styles = StyleSheet.create({
    action: {
        paddingHorizontal: 6,
        paddingVertical: 4,
    },
    label: {
        fontSize: 15,
        fontWeight: "600",
        color: "#0A7EA4",
    },
});
