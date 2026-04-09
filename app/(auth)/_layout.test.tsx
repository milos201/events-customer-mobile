import { render, screen } from "@testing-library/react-native";

import AuthLayout from "./_layout";
import { useAuthSession } from "@/features/auth/session-provider";

jest.mock("@/features/auth/session-provider", () => ({
    useAuthSession: jest.fn(),
}));

jest.mock("expo-router", () => {
    const React = require("react");
    const { Text } = require("react-native");

    return {
        Redirect: ({ href }: { href: unknown }) => <Text>{JSON.stringify(href)}</Text>,
        Stack: () => <Text>stack</Text>,
        useLocalSearchParams: jest.fn(() => ({})),
    };
});

const mockedUseAuthSession = jest.mocked(useAuthSession);
const { useLocalSearchParams } = jest.requireMock("expo-router") as {
    useLocalSearchParams: jest.Mock;
};

describe("AuthLayout", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders nothing while session is loading", () => {
        mockedUseAuthSession.mockReturnValue({
            status: "loading",
            user: null,
            session: null,
            signIn: jest.fn(),
            signOut: jest.fn(),
        });

        const { toJSON } = render(<AuthLayout />);

        expect(toJSON()).toBeNull();
    });

    it("redirects authenticated users to the requested route", () => {
        mockedUseAuthSession.mockReturnValue({
            status: "authenticated",
            user: null,
            session: null,
            signIn: jest.fn(),
            signOut: jest.fn(),
        });
        useLocalSearchParams.mockReturnValue({ returnTo: "/booking/shop-1" });

        render(<AuthLayout />);

        expect(screen.getByText('"/booking/shop-1"')).toBeTruthy();
    });

    it("renders the auth stack for anonymous users", () => {
        mockedUseAuthSession.mockReturnValue({
            status: "anonymous",
            user: null,
            session: null,
            signIn: jest.fn(),
            signOut: jest.fn(),
        });

        render(<AuthLayout />);

        expect(screen.getByText("stack")).toBeTruthy();
    });
});
