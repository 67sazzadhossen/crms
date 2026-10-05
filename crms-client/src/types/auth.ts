export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId?: string;
  monthlyQuotaHrs?: number;
};
