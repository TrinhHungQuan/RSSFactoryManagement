export interface FormAddValues {
  firstName: string;
  userName: string;
  role: string;
  engineeringTeams: string[];
  password: string;
  lastName: string;
  dateOfBirth: string;
  company: string[];
  status: string;
  image?: string;
}

export interface FormEditValues {
  firstName: string;
  userName: string;
  role: string;
  engineeringTeams: string[];
  lastName: string;
  dateOfBirth: string;
  company: string[];
  status: string;
  image?: string;
}
export interface FormPassword {
  password: string;
  confirmPassword: string;
}

