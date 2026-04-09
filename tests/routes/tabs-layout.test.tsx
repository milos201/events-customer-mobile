import { render, screen } from "@testing-library/react-native";

import TabsLayout from "@/../app/(tabs)/_layout";
import { useAuthSession } from "@/features/auth/session-provider";

jest.mock("@/features/auth/session-provider", () => ({
    useAuthSession: jest.fn(),
}));

jest.mock("@/hooks/use-color-scheme", () => ({
    useColorScheme: jest.fn(() => "light"),
}));

jest.mock("@/components/haptic-tab", () => ({
    HapticTab: "HapticTab",
}));

jest.mock("@/components/ui/icon-symbol", () => ({
    IconSymbol: () => null,
}));

jest.mock("expo-router", () => {
    const React = require("react");
    const { Text, View } = require("react-native");

    const Tabs = ({ children }: { children: React.ReactNode }) => <View>{children}</View>;
    Tabs.Screen = ({ name }: { name: string }) => <Text>{name}</Text>;

    return {
        Tabs,
        useRouter: () => ({ push: jest.fn() }),
    };
});

const mockedUseAuthSession = jest.mocked(useAuthSession);

describe("TabsLayout", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the global discover, appointments, and account tabs", () => {
        mockedUseAuthSession.mockReturnValue({
            status: "anonymous",
            user: null,
            session: null,
            signIn: jest.fn(),
            signOut: jest.fn(),
        });

        render(<TabsLayout />);

        expect(screen.getByText("(discover)")).toBeTruthy();
        expect(screen.getByText("appointments")).toBeTruthy();
        expect(screen.getByText("account")).toBeTruthy();
    });
});
