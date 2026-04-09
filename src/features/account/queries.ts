import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cancelOwnAppointment, listOwnAppointments } from "@/api/appointments";

export function useOwnAppointments() {
    return useQuery({
        queryKey: ["own-appointments"],
        queryFn: ({ signal }) => listOwnAppointments({ limit: 20 }, signal),
    });
}

export function useCancelOwnAppointment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cancelOwnAppointment,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["own-appointments"] });
        },
    });
}
