import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/theme";

export function useAppTheme() {
    const theme = useColorScheme() ?? "light";

    return Colors[theme];
}
