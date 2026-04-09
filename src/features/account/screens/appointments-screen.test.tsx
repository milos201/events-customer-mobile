import { fireEvent, render, screen } from "@testing-library/react-native";
import { Alert } from "react-native";

import { AppointmentsScreen } from "@/features/account/screens/appointments-screen";
import { useCancelOwnAppointment, useOwnAppointments } from "@/features/account/queries";
import { useAuthSession } from "@/features/auth/session-provider";

jest.mock("@/features/auth/session-provider", () => ({
    useAuthSession: jest.fn(),
}));

jest.mock("@/features/account/queries", () => ({
    useOwnAppointments: jest.fn(),
    useCancelOwnAppointment: jest.fn(),
}));

jest.mock("expo-router", () => {
    const React = require("react");
    const { Text } = require("react-native");

    return {
        Link: ({ children }: { children: React.ReactNode }) => children,
        useRouter: () => ({ canGoBack: () => false, back: jest.fn(), replace: jest.fn() }),
        usePathname: () => "/appointments",
    };
});

const mockedUseAuthSession = jest.mocked(useAuthSession);
const mockedUseOwnAppointments = jest.mocked(useOwnAppointments);
const mockedUseCancelOwnAppointment = jest.mocked(useCancelOwnAppointment);
const mockedAlert = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());

describe("AppointmentsScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("groups appointments and confirms cancellation before mutating", () => {
        const mutateAsync = jest.fn();
        const reset = jest.fn();
        const now = Date.now();

        mockedUseAuthSession.mockReturnValue({
            status: "authenticated",
            user: { id: "user-1", name: "Milos", email: "milos@example.com" } as never,
            session: null,
            signIn: jest.fn(),
            createAccount: jest.fn(),
            signOut: jest.fn(),
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
                        startsAt: new Date(now + 86_400_000).toISOString(),
                        endsAt: new Date(now + 86_400_000 + 1_800_000).toISOString(),
                        status: "confirmed",
                        customerNameSnapshot: "Milos",
                        customerPhoneSnapshot: null,
                        customerEmailSnapshot: "milos@example.com",
                        serviceNameSnapshot: "Haircut",
                        serviceDurationMinutesSnapshot: 30,
                        servicePriceCentsSnapshot: 2500,
                        notesCustomer: "Please be on time",
                        notesInternal: null,
                        bookedFrom: "public",
                        cancelledAt: null,
                        rejectedAt: null,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        company: { id: 11, name: "Barber Club", slug: "barber-club" },
                        employee: { id: "emp-1", name: "Alex", image: null },
                        customer: { id: "user-1", name: "Milos", image: null },
                    },
                    {
                        id: 2,
                        companyId: 11,
                        employeeId: "emp-1",
                        userId: "user-1",
                        serviceId: 7,
                        startsAt: new Date(now - 86_400_000).toISOString(),
                        endsAt: new Date(now - 86_400_000 + 1_800_000).toISOString(),
                        status: "completed",
                        customerNameSnapshot: "Milos",
                        customerPhoneSnapshot: null,
                        customerEmailSnapshot: "milos@example.com",
                        serviceNameSnapshot: "Haircut",
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
                        employee: { id: "emp-1", name: "Alex", image: null },
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

        expect(screen.getByText("Upcoming")).toBeTruthy();
        expect(screen.getByText("History")).toBeTruthy();
        expect(screen.getAllByText("Barber Club · Haircut")).toHaveLength(2);
        expect(screen.getByText("Notes: Please be on time")).toBeTruthy();
        expect(screen.getAllByText("Book again")).toHaveLength(2);
        expect(screen.getAllByText("Open shop")).toHaveLength(2);

        fireEvent.press(screen.getByText("Cancel appointment"));

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
