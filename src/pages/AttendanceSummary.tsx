import { useState } from 'react';
import { Calendar, Download, Search, Users, UserCheck, UserX, Clock } from 'lucide-react';
import { useStudents } from '../contexts/StudentContext';
import { generateAttendancePDF } from '../utils/pdfGenerator';

export function AttendanceSummary() {
  const { students, attendance, selectedDate, setSelectedDate } = useStudents();
  const [searchTerm, setSearchTerm] = useState('');
  
  const todayAttendance = attendance[selectedDate] || {};
  const stats = {
    total: students.length,
    present: Object.values(todayAttendance).filter(status => status === 'present').length,
    absent: Object.values(todayAttendance).filter(status => status === 'absent').length,
    pending: students.length - Object.keys(todayAttendance).length
  };

  // Sort students by numeric roll number ascending
  const sortedStudents = [...students].sort((a, b) => {
    const parseRoll = (roll: string): number => {
      const numeric = parseInt(String(roll).match(/\d+/)?.[0] || String(roll), 10);
      return isNaN(numeric) ? Number.MAX_SAFE_INTEGER : numeric;
    };
    const aNum = parseRoll(a.rollNumber);
    const bNum = parseRoll(b.rollNumber);
    if (aNum !== bNum) return aNum - bNum;
    // Fallback to lexicographic if numbers equal
    return String(a.rollNumber).localeCompare(String(b.rollNumber));
  });

  const filteredStudents = sortedStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadPDF = () => {
    generateAttendancePDF(students, attendance, selectedDate);
  };

  const handleDownloadCSV = () => {
    const today = attendance[selectedDate] || {};
    const headers = ['Roll No.', 'Name', 'Status'];
    const rows = sortedStudents.map((s) => {
      const status = today[s.id] === 'present' ? 'Present' : today[s.id] === 'absent' ? 'Absent' : 'Not Marked';
      // Escape commas and quotes for CSV cells
      const escapeCell = (val: unknown): string => {
        const str = String(val ?? '');
        if (/[",\n]/.test(str)) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      };
      return [escapeCell(s.rollNumber), escapeCell(s.name), escapeCell(status)].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_${selectedDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Attendance Summary
          </h1>
          <div className="flex items-center text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base">
            <Calendar size={18} className="mr-2" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-gray-900 dark:text-white font-medium cursor-pointer"
            />
          </div>
          
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center px-4 py-2 md:px-6 md:py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg text-sm md:text-base"
          >
            <Download size={18} className="mr-2" />
            Download PDF
          </button>
          <button
            onClick={handleDownloadCSV}
            className="flex items-center px-4 py-2 md:px-6 md:py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg text-sm md:text-base"
          >
            <Download size={18} className="mr-2" />
            Download Excel
          </button>
          
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 transform transition-all duration-200 hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Users size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Total Students</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 transform transition-all duration-200 hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <UserCheck size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {stats.present}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Present</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 transform transition-all duration-200 hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
              <UserX size={24} className="text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {stats.absent}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Absent</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 transform transition-all duration-200 hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <Clock size={24} className="text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {stats.pending}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
        <div className="flex items-center space-x-3 md:space-x-4 mb-4 md:mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search students by name or roll number..."
              className="w-full pl-10 pr-3 md:pr-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
            />
          </div>
        </div>

        

        {/* Students List */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2.5 md:py-3 px-3 md:px-4 font-semibold text-gray-900 dark:text-white text-sm md:text-base">
                  Roll No.
                </th>
                <th className="text-left py-2.5 md:py-3 px-3 md:px-4 font-semibold text-gray-900 dark:text-white text-sm md:text-base">
                  Name
                </th>
                <th className="text-center py-2.5 md:py-3 px-3 md:px-4 font-semibold text-gray-900 dark:text-white text-sm md:text-base">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const status = todayAttendance[student.id];
                return (
                  <tr
                    key={student.id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="py-3 md:py-4 px-3 md:px-4 text-gray-900 dark:text-white font-medium text-sm md:text-base">
                      {student.rollNumber}
                    </td>
                    <td className="py-3 md:py-4 px-3 md:px-4 text-gray-900 dark:text-white text-sm md:text-base">
                      {student.name}
                    </td>
                    <td className="py-3 md:py-4 px-3 md:px-4 text-center text-sm md:text-base">
                      <span
                        className={`
                          inline-flex px-3 py-1 rounded-full text-sm font-medium
                          ${status === 'present'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : status === 'absent'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }
                        `}
                      >
                        {status === 'present' 
                          ? 'Present' 
                          : status === 'absent' 
                          ? 'Absent' 
                          : 'Not Marked'
                        }
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
                No students found matching your search.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}