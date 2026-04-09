import { useQuery } from "@tanstack/react-query";

import { listPublicCompanies } from "@/api/companies";

type PublicCompaniesInput = {
    query?: string;
};

export function usePublicCompanies(input: PublicCompaniesInput = {}) {
    return useQuery({
        queryKey: ["public-companies", input],
        queryFn: ({ signal }) =>
            listPublicCompanies(
                {
                    limit: 20,
                    ...(input.query ? { query: input.query } : {}),
                },
                signal,
            ),
    });
}
