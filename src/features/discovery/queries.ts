import { useQuery } from "@tanstack/react-query";

import { listPublicCompanies } from "@/src/api/companies";

export function usePublicCompanies() {
    return useQuery({
        queryKey: ["public-companies"],
        queryFn: ({ signal }) => listPublicCompanies({ limit: 20 }, signal),
    });
}
