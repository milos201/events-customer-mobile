import { fireEvent, render, screen } from "@testing-library/react-native";

import { BookingScreen } from "@/features/bookings/screens/booking-screen";
import { useAuthSession } from "@/features/auth/session-provider";
import { useCreateAppointment, useBookingAvailability } from "@/features/bookings/queries";
import { usePublicCompanyBundle } from "@/features/shops/queries";

jest.mock("@react-native-community/datetimepicker", () => {
    const React = require("react");
    const { Pressable, Text } = require("react-native");

    return ({ onChange }: { onChange: (event: { type: string }, value?: Date) => void }) => (
        <Pressable onPress={() => onChange({ type: "set" }, new Date(2026, 3, 10))}>
            <Text>Pick Apr 10, 2026</Text>
        </Pressable>
    );
});

jest.mock("@/features/auth/session-provider", () => ({
    useAuthSession: jest.fn(),
}));

jest.mock("@/features/bookings/queries", () => ({
    useBookingAvailability: jest.fn(),
    useCreateAppointment: jest.fn(),
}));

jest.mock("@/features/shops/queries", () => ({
    usePublicCompanyBundle: jest.fn(),
}));

jest.mock("expo-router", () => {
    const React = require("react");
    const { Text } = require("react-native");

    return {
        Link: ({ children }: { children: React.ReactNode }) => children,
        useRouter: () => ({ canGoBack: () => false, back: jest.fn(), replace: jest.fn() }),
        usePathname: () => "/booking/shop-1",
        useLocalSearchParams: () => ({ shopId: "shop-1", serviceId: "7" }),
    };
});

const mockedUseAuthSession = jest.mocked(useAuthSession);
const mockedUseBookingAvailability = jest.mocked(useBookingAvailability);
const mockedUseCreateAppointment = jest.mocked(useCreateAppointment);
const mockedUsePublicCompanyBundle = jest.mocked(usePublicCompanyBundle);

describe("BookingScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("submits a booking request with the selected availability slot", () => {
        const mutateAsync = jest.fn();

        mockedUseAuthSession.mockReturnValue({
            status: "authenticated",
            user: { id: "user-1", name: "Milos", email: "milos@example.com" } as never,
            session: null,
            signIn: jest.fn(),
            createAccount: jest.fn(),
            signOut: jest.fn(),
        });
        mockedUsePublicCompanyBundle.mockReturnValue({
            data: {
                company: {
                    id: 11,
                    name: "Barber Club",
                    slug: "barber-club",
                    employees: [{ userId: "emp-1", user: { name: "Alex" } }],
                },
                services: [
                    {
                        id: 7,
                        name: "Haircut",
                        durationMinutes: 30,
                        priceCents: 2500,
                    },
                ],
            },
            isPending: false,
        } as never);
        mockedUseBookingAvailability.mockReturnValue({
            data: {
                startTimes: ["2026-04-10T10:00:00.000Z"],
            },
            isPending: false,
            isError: false,
            error: null,
        } as never);
        mockedUseCreateAppointment.mockReturnValue({
            mutateAsync,
            reset: jest.fn(),
            isPending: false,
            isError: false,
            isSuccess: false,
            error: null,
            data: null,
        } as never);

        render(<BookingScreen />);

        fireEvent.press(screen.getByText(/Apr 10, 2026/));
        fireEvent.press(screen.getByText("Request appointment"));

        expect(mutateAsync).toHaveBeenCalledWith(
            expect.objectContaining({
                companyId: 11,
                serviceId: 7,
                startsAt: "2026-04-10T10:00:00.000Z",
                assignAnyEmployee: true,
            }),
        );
    });

    it("keeps the locally selected day when the picker returns a Date object", () => {
        mockedUseAuthSession.mockReturnValue({
            status: "authenticated",
            user: { id: "user-1", name: "Milos", email: "milos@example.com" } as never,
            session: null,
            signIn: jest.fn(),
            createAccount: jest.fn(),
            signOut: jest.fn(),
        });
        mockedUsePublicCompanyBundle.mockReturnValue({
            data: {
                company: {
                    id: 11,
                    name: "Barber Club",
                    slug: "barber-club",
                    employees: [{ userId: "emp-1", user: { name: "Alex" } }],
                },
                services: [
                    {
                        id: 7,
                        name: "Haircut",
                        durationMinutes: 30,
                        priceCents: 2500,
                    },
                ],
            },
            isPending: false,
        } as never);
        mockedUseBookingAvailability.mockReturnValue({
            data: {
                startTimes: [],
            },
            isPending: false,
            isError: false,
            error: null,
        } as never);
        mockedUseCreateAppointment.mockReturnValue({
            mutateAsync: jest.fn(),
            reset: jest.fn(),
            isPending: false,
            isError: false,
            isSuccess: false,
            error: null,
            data: null,
        } as never);

        render(<BookingScreen />);

        fireEvent.press(screen.getByText(/Friday, April/));
        fireEvent.press(screen.getByText("Pick Apr 10, 2026"));

        const latestAvailabilityCall =
            mockedUseBookingAvailability.mock.calls[mockedUseBookingAvailability.mock.calls.length - 1]?.[0];

        expect(latestAvailabilityCall).toEqual(
            expect.objectContaining({
                date: "2026-04-10",
            }),
        );
    });
});
