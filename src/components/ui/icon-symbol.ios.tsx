import { SymbolView, type SymbolViewProps, type SymbolWeight } from "expo-symbols";
import type { StyleProp, ViewStyle } from "react-native";

type IconSymbolName =
    | "magnifyingglass"
    | "calendar"
    | "person.fill"
    | "mappin.and.ellipse"
    | "chevron.left"
    | "chevron.right";

type NativeSymbolMapping = Record<IconSymbolName, SymbolViewProps["name"]>;

const MAPPING = {
    magnifyingglass: "magnifyingglass",
    calendar: "calendar",
    "person.fill": "person.fill",
    "mappin.and.ellipse": "location.north.fill",
    "chevron.left": "chevron.left",
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
