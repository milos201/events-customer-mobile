jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));

jest.mock("@react-native-community/datetimepicker", () => "DateTimePicker");

jest.mock("@/lib/auth-client", () => ({
    authClient: {
        getCookie: jest.fn(() => ""),
        useSession: jest.fn(() => ({
            data: null,
            isPending: false,
            refetch: jest.fn(),
        })),
        signIn: {
            email: jest.fn(),
        },
        signOut: jest.fn(),
        $Infer: {
            Session: {},
        },
    },
}));

jest.mock("react-native-safe-area-context", () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));
