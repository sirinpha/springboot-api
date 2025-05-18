export interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
  department: string;
  salary: number;
  phone: string;
  address: string;
  joinDate: Date;
  password?: string;
  role?: string;
}
