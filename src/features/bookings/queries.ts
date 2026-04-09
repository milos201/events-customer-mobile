import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createCompanyAppointment } from "@/api/appointments";
import { getCompanyAvailability } from "@/api/availability";

type AvailabilityMode =
    | {
          companyId: number;
          serviceId: number;
          date: string;
          employeeId: string;
          assignAnyEmployee?: never;
      }
    | {
          companyId: number;
          serviceId: number;
          date: string;
          employeeId?: never;
          assignAnyEmployee: true;
      };

export function useBookingAvailability(input: AvailabilityMode | null) {
    return useQuery({
        queryKey: ["booking-availability", input],
        queryFn: ({ signal }) => {
            if (!input) {
                throw new Error("Availability input is required");
            }

            const { companyId, ...request } = input;
            return getCompanyAvailability(companyId, request, signal);
        },
        enabled: input !== null,
    });
}

export function useCreateAppointment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ companyId, ...input }: { companyId: number } & Parameters<typeof createCompanyAppointment>[1]) =>
            createCompanyAppointment(companyId, input),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["own-appointments"] });
        },
    });
}
