import React, { createContext, useContext, useEffect } from 'react';
import { Student, AttendanceData, StudentContextType } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import toast from 'react-hot-toast';
import { studentSeedData } from '../data/students';

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useLocalStorage<Student[]>('students', []);
  const [attendance, setAttendance] = useLocalStorage<AttendanceData>('attendance', {});
  const [selectedDate, setSelectedDate] = useLocalStorage('selectedDate', new Date().toISOString().split('T')[0]);

  // Auto-populate from seed if no students exist
  useEffect(() => {
    if (students.length === 0 && studentSeedData.length > 0) {
      const seeded: Student[] = studentSeedData.map((s, idx) => ({
        ...s,
        id: `${Date.now()}_${idx}`,
      }));
      setStudents(seeded);
      toast.success('Loaded default students');
    }
  }, []);

  // Data migration: align stored students with current seed list
  useEffect(() => {
    const CURRENT_VERSION = '4';
    const storedVersion = localStorage.getItem('dataVersion');
    if (storedVersion === CURRENT_VERSION) return;

    // Build case-insensitive name -> roll mapping from seed
    const nameToRoll = new Map<string, string>();
    for (const entry of studentSeedData) {
      nameToRoll.set(entry.name.trim().toLowerCase(), entry.rollNumber);
    }

    // Keep only students present in seed; update roll numbers accordingly
    const normalizedStudents: Student[] = students
      .filter((s) => nameToRoll.has(s.name.trim().toLowerCase()))
      .map((s) => ({
        ...s,
        rollNumber: nameToRoll.get(s.name.trim().toLowerCase()) || s.rollNumber,
      }));

    // Add any seed students missing from storage
    const existingNameSet = new Set(normalizedStudents.map((s) => s.name.trim().toLowerCase()));
    const additions: Student[] = [];
    studentSeedData.forEach((seed, idx) => {
      const key = seed.name.trim().toLowerCase();
      if (!existingNameSet.has(key)) {
        additions.push({ id: `seed_${Date.now()}_${idx}`, name: seed.name, rollNumber: seed.rollNumber, photo: undefined });
      }
    });

    const mergedStudents = [...normalizedStudents, ...additions];

    // If any student was removed, also purge their attendance
    if (mergedStudents.length !== students.length) {
      const validIds = new Set(normalizedStudents.map((s) => s.id));
      const newAttendance: AttendanceData = {};
      for (const [date, daily] of Object.entries(attendance)) {
        const filteredDaily: { [id: string]: 'present' | 'absent' } = {};
        for (const [sid, status] of Object.entries(daily)) {
          if (validIds.has(sid)) filteredDaily[sid] = status;
        }
        newAttendance[date] = filteredDaily;
      }
      setAttendance(newAttendance);
    }

    // Only set if changes or version bump
    // Ensure sorted by numeric roll number
    const sorted = [...mergedStudents].sort((a, b) => {
      const pa = parseInt(String(a.rollNumber).match(/\d+/)?.[0] || String(a.rollNumber), 10);
      const pb = parseInt(String(b.rollNumber).match(/\d+/)?.[0] || String(b.rollNumber), 10);
      if (!isNaN(pa) && !isNaN(pb)) return pa - pb;
      return String(a.rollNumber).localeCompare(String(b.rollNumber));
    });
    setStudents(sorted);
    localStorage.setItem('dataVersion', CURRENT_VERSION);
    if (students.length > 0) {
      toast.success('Student data updated to latest list');
    }
  }, [students, attendance, setAttendance, setStudents]);

  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...studentData,
      id: Date.now().toString(),
    };
    setStudents([...students, newStudent]);
    toast.success('Student added successfully!');
  };

  const removeStudent = (id: string) => {
    setStudents(students.filter(student => student.id !== id));
    // Remove attendance records for this student
    const updatedAttendance = { ...attendance };
    Object.keys(updatedAttendance).forEach(date => {
      delete updatedAttendance[date][id];
    });
    setAttendance(updatedAttendance);
    toast.success('Student removed successfully!');
  };

  const markAttendance = (studentId: string, status: 'present' | 'absent', date: string) => {
    setAttendance(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [studentId]: status
      }
    }));
    toast.success(`Marked as ${status}!`);
    // Optional: could trigger a backup reminder here (left minimal to avoid UX noise)
  };

  const getTodayStats = () => {
    const todayAttendance = attendance[selectedDate] || {};
    const total = students.length;
    const marked = Object.keys(todayAttendance).length;
    const present = Object.values(todayAttendance).filter(status => status === 'present').length;
    const absent = Object.values(todayAttendance).filter(status => status === 'absent').length;
    const pending = total - marked;

    return { total, present, absent, pending };
  };

  const exportBackup = (): string => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      students,
      attendance,
      selectedDate,
    };
    return JSON.stringify(payload, null, 2);
  };

  const importBackup = (jsonString: string): { success: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') throw new Error('Invalid file');
      if (!Array.isArray(parsed.students)) throw new Error('Missing students');
      if (!parsed.attendance || typeof parsed.attendance !== 'object') throw new Error('Missing attendance');
      setStudents(parsed.students);
      setAttendance(parsed.attendance);
      if (typeof parsed.selectedDate === 'string') {
        setSelectedDate(parsed.selectedDate);
      }
      toast.success('Backup restored');
      return { success: true };
    } catch (e: any) {
      const message = e?.message || 'Failed to import backup';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  return (
    <StudentContext.Provider value={{
      students,
      attendance,
      selectedDate,
      addStudent,
      removeStudent,
      markAttendance,
      setSelectedDate,
      getTodayStats,
      exportBackup,
      importBackup,
    }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudents() {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudents must be used within a StudentProvider');
  }
  return context;
}