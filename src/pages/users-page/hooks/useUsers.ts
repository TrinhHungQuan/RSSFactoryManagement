import { useState } from 'react'

export interface User {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  company: string[];
  engineeringTeam: string[];
  dateOfBirth: Date | null;
  role: string;
  status: string;
  image: string;
  projectManager?: boolean;
}

const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  return {users, setUsers};
}

export default useUsers