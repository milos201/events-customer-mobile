import { render, screen } from "@testing-library/react-native";

import CustomerLayout from "@/../app/(customer)/_layout";
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
        Redirect: ({ href }: { href: unknown }) => <Text>{JSON.stringify(href)}</Text>,
        Tabs,
        usePathname: jest.fn(() => "/appointments"),
    };
});

const mockedUseAuthSession = jest.mocked(useAuthSession);

describe("CustomerLayout", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("redirects anonymous users to sign-in with returnTo", () => {
        mockedUseAuthSession.mockReturnValue({
            status: "anonymous",
            user: null,
            session: null,
            signIn: jest.fn(),
            signOut: jest.fn(),
        });

        render(<CustomerLayout />);

        expect(screen.getByText('{"pathname":"/sign-in","params":{"returnTo":"/appointments"}}')).toBeTruthy();
    });

    it("renders the customer tabs for authenticated users", () => {
        mockedUseAuthSession.mockReturnValue({
            status: "authenticated",
            user: null,
            session: null,
            signIn: jest.fn(),
            signOut: jest.fn(),
        });

        render(<CustomerLayout />);

        expect(screen.getByText("appointments")).toBeTruthy();
        expect(screen.getByText("account")).toBeTruthy();
    });
});
