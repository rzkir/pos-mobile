interface User {
  id: number;
  username: string;
  email: string;
  role: "admins" | "karyawan";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: "admins" | "karyawan";
}
