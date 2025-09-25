export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  photo?: string;
}

export interface AttendanceRecord {
  studentId: string;
  status: 'present' | 'absent';
  date: string;
}

export interface AttendanceData {
  [date: string]: {
    [studentId: string]: 'present' | 'absent';
  };
}

export interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export interface StudentContextType {
  students: Student[];
  attendance: AttendanceData;
  selectedDate: string;
  addStudent: (student: Omit<Student, 'id'>) => void;
  removeStudent: (id: string) => void;
  markAttendance: (studentId: string, status: 'present' | 'absent', date: string) => void;
  setSelectedDate: (date: string) => void;
  getTodayStats: () => { total: number; present: number; absent: number; pending: number };
  exportBackup: () => string;
  importBackup: (jsonString: string) => { success: boolean; error?: string };
}