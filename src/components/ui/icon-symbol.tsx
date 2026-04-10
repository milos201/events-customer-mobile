// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { SymbolWeight } from "expo-symbols";
import type { ComponentProps } from "react";
import type { OpaqueColorValue, StyleProp, TextStyle } from "react-native";

type IconSymbolName =
    | "magnifyingglass"
    | "calendar"
    | "person.fill"
    | "mappin.and.ellipse"
    | "chevron.left"
    | "chevron.right";

type IconMapping = Record<IconSymbolName, ComponentProps<typeof MaterialIcons>["name"]>;

const MAPPING = {
    magnifyingglass: "search",
    calendar: "calendar-today",
    "person.fill": "person",
    "mappin.and.ellipse": "near-me",
    "chevron.left": "chevron-left",
    "chevron.right": "chevron-right",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
    name,
    size = 24,
    color,
    style,
}: {
    name: IconSymbolName;
    size?: number;
    color: string | OpaqueColorValue;
    style?: StyleProp<TextStyle>;
    weight?: SymbolWeight;
}) {
    return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
