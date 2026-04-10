import { fireEvent, render, screen } from "@testing-library/react-native";

import { useAuthSession } from "@/features/auth/session-provider";
import { useBookingAvailability, useCreateAppointment } from "@/features/bookings/queries";
import { BookingScreen } from "@/features/bookings/screens/booking-screen";
import { usePublicCompanyBundle } from "@/features/shops/queries";

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

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
    useRouter: () => ({
        canGoBack: () => false,
        back: mockBack,
        push: mockPush,
        replace: mockReplace,
    }),
    usePathname: () => "/booking/shop-1",
    useLocalSearchParams: () => ({ shopId: "shop-1" }),
}));

const mockedUseAuthSession = jest.mocked(useAuthSession);
const mockedUseBookingAvailability = jest.mocked(useBookingAvailability);
const mockedUseCreateAppointment = jest.mocked(useCreateAppointment);
const mockedUsePublicCompanyBundle = jest.mocked(usePublicCompanyBundle);

function formatTimeLabel(value: string) {
    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(value));
}

describe("BookingScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2026, 3, 9, 9, 0, 0));

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
                    address: "123 Main Street",
                    city: "Nis",
                    timezone: "Europe/Belgrade",
                    employees: [
                        { userId: "emp-1", user: { name: "Alex", image: null } },
                        { userId: "emp-2", user: { name: "Marcus", image: null } },
                    ],
                },
                services: [
                    {
                        id: 7,
                        name: "Haircut",
                        durationMinutes: 30,
                        priceCents: 2500,
                    },
                    {
                        id: 8,
                        name: "Beard Trim",
                        durationMinutes: 20,
                        priceCents: 1500,
                    },
                ],
            },
            isPending: false,
            isError: false,
            error: null,
        } as never);
        mockedUseBookingAvailability.mockReturnValue({
            data: {
                startTimes: ["2026-04-09T10:00:00.000Z", "2026-04-10T09:30:00.000Z"],
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
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("submits a booking request after walking through the four-step flow", () => {
        const mutateAsync = jest.fn();

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

        fireEvent.press(screen.getByText("Any Available"));
        fireEvent.press(screen.getByText("Haircut"));
        fireEvent.press(screen.getByText(formatTimeLabel("2026-04-09T10:00:00.000Z")));
        fireEvent.press(screen.getAllByText("Confirm Booking")[1]);

        expect(mutateAsync).toHaveBeenCalledWith(
            expect.objectContaining({
                companyId: 11,
                serviceId: 7,
                startsAt: "2026-04-09T10:00:00.000Z",
                assignAnyEmployee: true,
            }),
        );
    });

    it("updates availability when the selected day changes", () => {
        render(<BookingScreen />);

        fireEvent.press(screen.getByText("Any Available"));
        fireEvent.press(screen.getByText("Haircut"));
        fireEvent.press(screen.getByText("Tomorrow"));

        const latestAvailabilityCall =
            mockedUseBookingAvailability.mock.calls[mockedUseBookingAvailability.mock.calls.length - 1]?.[0];

        expect(latestAvailabilityCall).toEqual(
            expect.objectContaining({
                date: "2026-04-10",
            }),
        );
    });
});
