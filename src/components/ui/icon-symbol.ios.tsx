import { SymbolView, type SymbolViewProps, type SymbolWeight } from "expo-symbols";
import type { StyleProp, ViewStyle } from "react-native";

type IconSymbolName =
    | "house.fill"
    | "magnifyingglass"
    | "paperplane.fill"
    | "calendar"
    | "person.fill"
    | "mappin.and.ellipse"
    | "chevron.left"
    | "chevron.left.forwardslash.chevron.right"
    | "chevron.right";

type NativeSymbolMapping = Record<IconSymbolName, SymbolViewProps["name"]>;

const MAPPING = {
    "house.fill": "house.fill",
    magnifyingglass: "magnifyingglass",
    "paperplane.fill": "paperplane.fill",
    calendar: "calendar",
    "person.fill": "person.fill",
    "mappin.and.ellipse": "location.north.fill",
    "chevron.left": "chevron.left",
    "chevron.left.forwardslash.chevron.right": "chevron.left.forwardslash.chevron.right",
    "chevron.right": "chevron.right",
} as const satisfies NativeSymbolMapping;

export function IconSymbol({
    name,
    size = 24,
    color,
    style,
    weight = "regular",
}: {
    name: IconSymbolName;
    size?: number;
    color: string;
    style?: StyleProp<ViewStyle>;
    weight?: SymbolWeight;
}) {
    return (
        <SymbolView
            weight={weight}
            tintColor={color}
            resizeMode="scaleAspectFit"
            name={MAPPING[name]}
            style={[
                {
                    width: size,
                    height: size,
                },
                style,
            ]}
        />
    );
}
