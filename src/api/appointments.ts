import { apiGet, apiPost } from "@/api/http";
import type { AppointmentRecord, AppointmentStatus, PaginatedResult } from "@/api/types";

type ListOwnAppointmentsInput = {
    cursor?: string;
    limit?: number;
    status?: AppointmentStatus;
};

export async function listOwnAppointments(input: ListOwnAppointmentsInput = {}, signal?: AbortSignal) {
    return await apiGet<PaginatedResult<AppointmentRecord>>("/users/me/appointments", {
        query: input,
        signal,
    });
}

export async function cancelOwnAppointment(appointmentId: number) {
    return await apiPost<AppointmentRecord>(`/users/me/appointments/${appointmentId}/cancel`);
}

type CreateCompanyAppointmentInput =
    | {
          serviceId: number;
          startsAt: string;
          employeeId: string;
          assignAnyEmployee?: never;
          notesCustomer?: string;
      }
    | {
          serviceId: number;
          startsAt: string;
          employeeId?: never;
          assignAnyEmployee: true;
          notesCustomer?: string;
      };

export async function createCompanyAppointment(companyId: number, input: CreateCompanyAppointmentInput) {
    const body =
        "assignAnyEmployee" in input
            ? {
                  serviceId: input.serviceId,
                  startsAt: input.startsAt,
                  assignAnyEmployee: true as const,
                  ...(input.notesCustomer ? { notesCustomer: input.notesCustomer } : {}),
              }
            : {
                  serviceId: input.serviceId,
                  startsAt: input.startsAt,
                  employeeId: input.employeeId,
                  ...(input.notesCustomer ? { notesCustomer: input.notesCustomer } : {}),
              };

    return await apiPost<AppointmentRecord>(`/companies/${companyId}/appointments`, {
        body,
    });
}
