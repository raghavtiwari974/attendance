import { useState, useEffect } from 'react';
import { Calendar, Users, TrendingUp } from 'lucide-react';
import { StudentCard } from '../components/StudentCard';
import { useStudents } from '../contexts/StudentContext';

export function Home() {
  const { 
    students, 
    attendance, 
    selectedDate, 
    setSelectedDate, 
    markAttendance, 
    getTodayStats 
  } = useStudents();
  
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const stats = getTodayStats();
  const todayAttendance = attendance[selectedDate] || {};

  // Sort students by numeric roll number ascending
  const sortedStudents = [...students].sort((a, b) => {
    const parseRoll = (roll: string): number => {
      const numeric = parseInt(String(roll).match(/\d+/)?.[0] || String(roll), 10);
      return isNaN(numeric) ? Number.MAX_SAFE_INTEGER : numeric;
    };
    const aNum = parseRoll(a.rollNumber);
    const bNum = parseRoll(b.rollNumber);
    if (aNum !== bNum) return aNum - bNum;
    return String(a.rollNumber).localeCompare(String(b.rollNumber));
  });

  // Reset to first unmarked student when date changes
  useEffect(() => {
    const firstUnmarkedIndex = sortedStudents.findIndex(student => !todayAttendance[student.id]);
    setCurrentStudentIndex(firstUnmarkedIndex >= 0 ? firstUnmarkedIndex : 0);
  }, [selectedDate, students, todayAttendance]);

  const currentStudent = sortedStudents[currentStudentIndex];
  const isCurrentMarked = currentStudent && todayAttendance[currentStudent.id];
  const currentStatus = currentStudent ? todayAttendance[currentStudent.id] : undefined;

  const handleMarkAttendance = (status: 'present' | 'absent') => {
    if (!currentStudent) return;
    
    markAttendance(currentStudent.id, status, selectedDate);
    
    // Move to next unmarked student after a brief delay
    setTimeout(() => {
      const nextUnmarkedIndex = sortedStudents.findIndex((student, index) => 
        index > currentStudentIndex && !todayAttendance[student.id]
      );
      
      if (nextUnmarkedIndex >= 0) {
        setCurrentStudentIndex(nextUnmarkedIndex);
      } else {
        // If no more unmarked students, stay on current or go to next
        const nextIndex = currentStudentIndex + 1;
        if (nextIndex < sortedStudents.length) {
          setCurrentStudentIndex(nextIndex);
        }
      }
    }, 1500);
  };

  const handleUndo = () => {
    if (!currentStudent) return;
    
    const updatedAttendance = { ...attendance };
    if (updatedAttendance[selectedDate]) {
      delete updatedAttendance[selectedDate][currentStudent.id];
    }
    
    // This would need to be implemented in the context
    // For now, we'll just mark as opposite to demonstrate
    markAttendance(currentStudent.id, currentStatus === 'present' ? 'absent' : 'present', selectedDate);
  };

  const navigateStudent = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentStudentIndex > 0) {
      setCurrentStudentIndex(currentStudentIndex - 1);
    } else if (direction === 'next' && currentStudentIndex < sortedStudents.length - 1) {
      setCurrentStudentIndex(currentStudentIndex + 1);
    }
  };

  if (sortedStudents.length === 0) {
    return (
      <div className="text-center py-12">
        <Users size={48} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          No Students Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Add students to start taking attendance.
        </p>
        <a
          href="/students"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Users size={20} className="mr-2" />
          Manage Students
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Daily Attendance
            </h1>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Calendar size={20} className="mr-2" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-gray-900 dark:text-white font-medium cursor-pointer"
              />
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.present}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Present</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Absent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>
          </div>
        </div>
      </div>

      

      {/* Student Card */}
      {currentStudent && (
        <StudentCard
          student={currentStudent}
          onMarkPresent={() => handleMarkAttendance('present')}
          onMarkAbsent={() => handleMarkAttendance('absent')}
          onUndo={handleUndo}
          isMarked={!!isCurrentMarked}
          currentStatus={currentStatus}
          canUndo={!!isCurrentMarked}
        />
      )}

      {/* Navigation */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => navigateStudent('prev')}
          disabled={currentStudentIndex === 0}
          className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => navigateStudent('next')}
          disabled={currentStudentIndex === students.length - 1}
          className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>

      {/* Completion Message */}
      {stats.pending === 0 && stats.total > 0 && (
        <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-xl p-6 text-center">
          <TrendingUp size={32} className="mx-auto text-green-600 dark:text-green-400 mb-4" />
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
            Attendance Complete!
          </h3>
          <p className="text-green-700 dark:text-green-300">
            All students have been marked for {new Date(selectedDate).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}