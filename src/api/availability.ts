import { apiGet } from "@/src/api/http";
import type { AvailabilityResult } from "@/src/api/types";

type AvailabilityInput =
    | {
          serviceId: number;
          date: string;
          employeeId: string;
          assignAnyEmployee?: never;
      }
    | {
          serviceId: number;
          date: string;
          employeeId?: never;
          assignAnyEmployee: true;
      };

export async function getCompanyAvailability(companyId: number, input: AvailabilityInput, signal?: AbortSignal) {
    return await apiGet<AvailabilityResult>(`/companies/${companyId}/availability`, {
        query: input,
        signal,
    });
}
