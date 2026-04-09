export type PaginatedResult<T> = {
    results: T[];
    nextCursor: string | null;
};

export type CompanyStatus = "pending" | "approved" | "rejected";
export type CompanyEmployeeRole = "owner" | "employee" | "manager";

export type VisibleUser = {
    id: string;
    name: string | null;
    image: string | null;
};

export type PublicCompany = {
    id: number;
    userId: string | null;
    name: string;
    slug: string;
    status: CompanyStatus;
    approvedAt: string | null;
    approvedBy: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    timezone: string | null;
    latitude: number | null;
    longitude: number | null;
    createdAt: string;
    updatedAt: string;
    distanceMeters?: number;
};

export type VisibleEmployee = {
    companyId: number;
    userId: string;
    role: CompanyEmployeeRole;
    user: VisibleUser | null;
};

export type CompanyDetails = PublicCompany & {
    user: VisibleUser | null;
    employees: VisibleEmployee[];
};

export type Service = {
    id: number;
    companyId: number;
    name: string;
    description: string | null;
    durationMinutes: number;
    priceCents: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type AvailabilityResult = {
    date: string;
    timezone: string;
    serviceId: number;
    employeeId?: string;
    assignAnyEmployee: boolean;
    startTimes: string[];
};

export type PublicCompanyBundle = {
    company: CompanyDetails;
    services: Service[];
};
