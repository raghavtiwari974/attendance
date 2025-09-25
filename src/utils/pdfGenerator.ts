import jsPDF from 'jspdf';
import { Student, AttendanceData } from '../types';

export function generateAttendancePDF(
  students: Student[],
  attendance: AttendanceData,
  date: string
) {
  const pdf = new jsPDF();
  
  // Title
  pdf.setFontSize(20);
  pdf.text('Section 5 Attendance', 20, 30);
  
  // Date
  pdf.setFontSize(12);
  pdf.text(`Date: ${new Date(date).toLocaleDateString()}`, 20, 45);
  
  // Table headers
  const startY = 60;
  pdf.setFontSize(10);
  pdf.text('Roll No.', 20, startY);
  pdf.text('Name', 60, startY);
  pdf.text('Status', 140, startY);
  
  // Draw line under headers
  pdf.line(20, startY + 2, 180, startY + 2);
  
  // Student data
  let currentY = startY + 10;
  const todayAttendance = attendance[date] || {};
  
  students.forEach((student, index) => {
    const status = todayAttendance[student.id] || 'Not Marked';
    
    pdf.text(student.rollNumber, 20, currentY);
    pdf.text(student.name, 60, currentY);
    pdf.text(status === 'present' ? 'Present' : status === 'absent' ? 'Absent' : 'Not Marked', 140, currentY);
    
    currentY += 8;
    
    // Add new page if needed
    if (currentY > 270) {
      pdf.addPage();
      currentY = 20;
    }
  });
  
  // Summary
  const stats = {
    total: students.length,
    present: Object.values(todayAttendance).filter(status => status === 'present').length,
    absent: Object.values(todayAttendance).filter(status => status === 'absent').length,
  };
  
  currentY += 10;
  pdf.line(20, currentY, 180, currentY);
  currentY += 10;
  
  pdf.text(`Total Students: ${stats.total}`, 20, currentY);
  pdf.text(`Present: ${stats.present}`, 20, currentY + 8);
  pdf.text(`Absent: ${stats.absent}`, 20, currentY + 16);
  pdf.text(`Not Marked: ${stats.total - stats.present - stats.absent}`, 20, currentY + 24);
  
  // Save the PDF
  pdf.save(`section-5-attendance-${date}.pdf`);
}