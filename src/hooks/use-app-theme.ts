import { Colors } from "@/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function useAppTheme() {
    const theme = useColorScheme() ?? "light";

    return Colors[theme];
}
