// Generic API Response
export interface ApiResponse<T> {
  code: string;
  message: string;
  data: T;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

// Generic Paginated Data
export interface PagedResponse<T> extends Pagination {
  items: T[];
}

export interface Employee {
  id: number;
  name: string | null;
  email: string | null;
  position: string | null;
  department: string | null;
  joinDate: string | null;     // หรือใช้ Date ถ้าจะ parse เป็น Date
  salary: number | null;
  phone: string | null;
  address: string | null;
  role: 'USER' | 'ADMIN' | string;  // เพิ่ม role อื่นๆ ได้
  createdAt: string | null;    // หรือ Date | null
  enabled: boolean | null;
}

