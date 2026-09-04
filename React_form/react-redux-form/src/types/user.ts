export interface Education {
  degree: string;
  institute: string;
  yearPassed: string;
}

export interface User {
  id?: number | string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  gender: string;
  education: Education[];
  applicationUserId?: string | null;
}
 export interface PaginatedUsers{
  items: User[];
  page:number;
  pageSize:number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
 }