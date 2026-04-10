import { fireEvent, render, screen } from "@testing-library/react-native";

import { useOwnAppointments } from "@/features/account/queries";
import { AccountScreen } from "@/features/account/screens/account-screen";
import { useAuthSession } from "@/features/auth/session-provider";

jest.mock("@/features/auth/session-provider", () => ({
    useAuthSession: jest.fn(),
}));

jest.mock("@/features/account/queries", () => ({
    useOwnAppointments: jest.fn(),
}));

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

jest.mock("expo-constants", () => ({
    expoConfig: {
        version: "1.0.0",
    },
}));

const mockSignOut = jest.fn();

jest.mock("expo-router", () => ({
    usePathname: () => "/account",
}));

const mockedUseAuthSession = jest.mocked(useAuthSession);
const mockedUseOwnAppointments = jest.mocked(useOwnAppointments);

describe("AccountScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2026, 3, 10, 9, 0, 0));

        mockedUseAuthSession.mockReturnValue({
            status: "authenticated",
            user: {
                id: "user-1",
                name: "John Doe",
                email: "john.doe@email.com",
                createdAt: "2024-03-15T10:00:00.000Z",
            } as never,
            session: null,
            signIn: jest.fn(),
            createAccount: jest.fn(),
            signOut: mockSignOut,
        });

        mockedUseOwnAppointments.mockReturnValue({
            data: {
                results: [
                    {
                        id: 1,
                        companyId: 11,
                        employeeId: "emp-1",
                        userId: "user-1",
                        serviceId: 7,
                        startsAt: "2026-04-12T12:30:00.000Z",
                        endsAt: "2026-04-12T13:00:00.000Z",
                        status: "confirmed",
                        customerNameSnapshot: "John Doe",
                        customerPhoneSnapshot: null,
                        customerEmailSnapshot: "john.doe@email.com",
                        serviceNameSnapshot: "Fade Haircut",
                        serviceDurationMinutesSnapshot: 30,
                        servicePriceCentsSnapshot: 2500,
                        notesCustomer: null,
                        notesInternal: null,
                        bookedFrom: "public",
                        cancelledAt: null,
                        rejectedAt: null,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        company: { id: 11, name: "Barber Club", slug: "barber-club" },
                        employee: { id: "emp-1", name: "Marcus", image: null },
                        customer: { id: "user-1", name: "John Doe", image: null },
                    },
                    {
                        id: 2,
                        companyId: 12,
                        employeeId: "emp-2",
                        userId: "user-1",
                        serviceId: 8,
                        startsAt: "2026-04-08T10:00:00.000Z",
                        endsAt: "2026-04-08T10:30:00.000Z",
                        status: "completed",
                        customerNameSnapshot: "John Doe",
                        customerPhoneSnapshot: null,
                        customerEmailSnapshot: "john.doe@email.com",
                        serviceNameSnapshot: "Beard Trim",
                        serviceDurationMinutesSnapshot: 30,
                        servicePriceCentsSnapshot: 1800,
                        notesCustomer: null,
                        notesInternal: null,
                        bookedFrom: "public",
                        cancelledAt: null,
                        rejectedAt: null,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        company: { id: 12, name: "Old Town Barbers", slug: "old-town-barbers" },
                        employee: { id: "emp-2", name: "Alex", image: null },
                        customer: { id: "user-1", name: "John Doe", image: null },
                    },
                ],
                nextCursor: null,
            },
            isPending: false,
            isError: false,
            error: null,
        } as never);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("shows profile details, stats, and real account actions", () => {
        render(<AccountScreen />);

        expect(screen.getByText("Profile")).toBeTruthy();
        expect(screen.getByText("John Doe")).toBeTruthy();
        expect(screen.getByText("john.doe@email.com")).toBeTruthy();
        expect(screen.getByText("Member since March 2024")).toBeTruthy();
        expect(screen.getByText("Total Bookings")).toBeTruthy();
        expect(screen.getByText("Upcoming Visits")).toBeTruthy();
        expect(screen.getByText("Clippr v1.0.0")).toBeTruthy();

        fireEvent.press(screen.getByText("Sign Out"));

        expect(mockSignOut).toHaveBeenCalled();
    });
});
