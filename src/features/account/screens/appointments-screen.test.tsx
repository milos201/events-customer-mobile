import { fireEvent, render, screen } from "@testing-library/react-native";
import { Alert } from "react-native";

import { useCancelOwnAppointment, useOwnAppointments } from "@/features/account/queries";
import { AppointmentsScreen } from "@/features/account/screens/appointments-screen";
import { useAuthSession } from "@/features/auth/session-provider";

jest.mock("@/features/auth/session-provider", () => ({
    useAuthSession: jest.fn(),
}));

jest.mock("@/features/account/queries", () => ({
    useOwnAppointments: jest.fn(),
    useCancelOwnAppointment: jest.fn(),
}));

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
    useRouter: () => ({
        push: mockPush,
    }),
    usePathname: () => "/appointments",
}));

const mockedUseAuthSession = jest.mocked(useAuthSession);
const mockedUseOwnAppointments = jest.mocked(useOwnAppointments);
const mockedUseCancelOwnAppointment = jest.mocked(useCancelOwnAppointment);
const mockedAlert = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());

describe("AppointmentsScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2026, 3, 10, 9, 0, 0));

        mockedUseAuthSession.mockReturnValue({
            status: "authenticated",
            user: { id: "user-1", name: "Milos", email: "milos@example.com" } as never,
            session: null,
            signIn: jest.fn(),
            createAccount: jest.fn(),
            signOut: jest.fn(),
        });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("shows upcoming bookings by default and switches to past bookings", () => {
        mockedUseOwnAppointments.mockReturnValue({
            data: {
                results: [
                    {
                        id: 1,
                        companyId: 11,
                        employeeId: "emp-1",
                        userId: "user-1",
                        serviceId: 7,
                        startsAt: "2026-04-11T12:30:00.000Z",
                        endsAt: "2026-04-11T13:00:00.000Z",
                        status: "confirmed",
                        customerNameSnapshot: "Milos",
                        customerPhoneSnapshot: null,
                        customerEmailSnapshot: "milos@example.com",
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
                        customer: { id: "user-1", name: "Milos", image: null },
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
                        customerNameSnapshot: "Milos",
                        customerPhoneSnapshot: null,
                        customerEmailSnapshot: "milos@example.com",
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
                        customer: { id: "user-1", name: "Milos", image: null },
                    },
                ],
                nextCursor: null,
            },
            isPending: false,
            isError: false,
            error: null,
        } as never);
        mockedUseCancelOwnAppointment.mockReturnValue({
            mutateAsync: jest.fn(),
            reset: jest.fn(),
            isPending: false,
            isError: false,
            isSuccess: false,
            error: null,
            data: null,
            variables: undefined,
        } as never);

        render(<AppointmentsScreen />);

        expect(screen.getByText("My Bookings")).toBeTruthy();
        expect(screen.getByText("Barber Club")).toBeTruthy();
        expect(screen.queryByText("Old Town Barbers")).toBeNull();
        expect(screen.getByText("Upcoming")).toBeTruthy();
        expect(screen.getByText("Past")).toBeTruthy();

        fireEvent.press(screen.getByText("Past"));

        expect(screen.getByText("Old Town Barbers")).toBeTruthy();
        expect(screen.queryByText("Barber Club")).toBeNull();
    });

    it("confirms cancellation before mutating the upcoming booking", () => {
        const mutateAsync = jest.fn();
        const reset = jest.fn();

        mockedUseOwnAppointments.mockReturnValue({
            data: {
                results: [
                    {
                        id: 1,
                        companyId: 11,
                        employeeId: "emp-1",
                        userId: "user-1",
                        serviceId: 7,
                        startsAt: "2026-04-11T12:30:00.000Z",
                        endsAt: "2026-04-11T13:00:00.000Z",
                        status: "confirmed",
                        customerNameSnapshot: "Milos",
                        customerPhoneSnapshot: null,
                        customerEmailSnapshot: "milos@example.com",
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
                        customer: { id: "user-1", name: "Milos", image: null },
                    },
                ],
                nextCursor: null,
            },
            isPending: false,
            isError: false,
            error: null,
        } as never);
        mockedUseCancelOwnAppointment.mockReturnValue({
            mutateAsync,
            reset,
            isPending: false,
            isError: false,
            isSuccess: false,
            error: null,
            data: null,
            variables: undefined,
        } as never);

        render(<AppointmentsScreen />);

        fireEvent.press(screen.getByText("Cancel"));

        expect(mockedAlert).toHaveBeenCalledWith(
            "Cancel appointment?",
            "This will release the slot if the shop still accepts changes.",
            expect.any(Array),
        );

        const buttons = mockedAlert.mock.calls[0]?.[2];
        const destructiveButton = Array.isArray(buttons)
            ? buttons.find((button) => button.text === "Cancel appointment")
            : null;

        destructiveButton?.onPress?.();

        expect(reset).toHaveBeenCalled();
        expect(mutateAsync).toHaveBeenCalledWith(1);
    });
});
