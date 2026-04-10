import { apiGet } from "@/api/http";
import type { CompanyDetails, PaginatedResult, PublicCompany, PublicCompanyBundle, Service } from "@/api/types";

type ListPublicCompaniesInput = {
    cursor?: string;
    query?: string;
    limit?: number;
    lat?: number;
    lng?: number;
    radius?: number;
};

export async function listPublicCompanies(input: ListPublicCompaniesInput = {}, signal?: AbortSignal) {
    return await apiGet<PaginatedResult<PublicCompany>>("/companies", { query: input, signal });
}

export async function getPublicCompanyBySlug(slug: string, signal?: AbortSignal) {
    return await apiGet<PublicCompany>(`/companies/public/${slug}`, { signal });
}

export async function getCompanyDetails(companyId: number, signal?: AbortSignal) {
    return await apiGet<CompanyDetails>(`/companies/${companyId}`, { signal });
}

export async function getPublicCompanyBundleBySlug(slug: string, signal?: AbortSignal): Promise<PublicCompanyBundle> {
    const publicCompany = await getPublicCompanyBySlug(slug, signal);
    const [company, services] = await Promise.all([
        getCompanyDetails(publicCompany.id, signal),
        apiGet<PaginatedResult<Service>>(`/companies/${publicCompany.id}/services`, { query: { limit: 50 }, signal }),
    ]);

    return {
        company,
        services: services.results,
    };
}
