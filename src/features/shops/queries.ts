import { useQuery } from "@tanstack/react-query";

import { getPublicCompanyBundleBySlug } from "@/api/companies";

export function usePublicCompanyBundle(slug: string) {
    return useQuery({
        queryKey: ["public-company", slug],
        queryFn: ({ signal }) => getPublicCompanyBundleBySlug(slug, signal),
        enabled: slug.length > 0,
    });
}
