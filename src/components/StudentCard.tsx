import React from 'react';
import { User, Check, X, Undo } from 'lucide-react';
import { Student } from '../types';

interface StudentCardProps {
  student: Student;
  onMarkPresent: () => void;
  onMarkAbsent: () => void;
  onUndo: () => void;
  isMarked: boolean;
  currentStatus?: 'present' | 'absent';
  canUndo: boolean;
}

export function StudentCard({ 
  student, 
  onMarkPresent, 
  onMarkAbsent, 
  onUndo, 
  isMarked, 
  currentStatus,
  canUndo 
}: StudentCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md mx-auto transform transition-all duration-300 hover:scale-105 animate-in fade-in-0 zoom-in-95">
      {/* Student Info */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          {student.photo ? (
            <img 
              src={student.photo} 
              alt={student.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User size={40} className="text-gray-400" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {student.name}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Roll No: {student.rollNumber}
        </p>
      </div>

      {/* Status Display */}
      {isMarked && (
        <div className={`
          text-center mb-6 p-3 rounded-lg
          ${currentStatus === 'present' 
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          }
        `}>
          <p className="font-semibold">
            Marked as {currentStatus === 'present' ? 'Present' : 'Absent'}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-4">
        {!isMarked ? (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onMarkPresent}
              className="flex items-center justify-center px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transform transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
            >
              <Check size={20} className="mr-2" />
              Present
            </button>
            <button
              onClick={onMarkAbsent}
              className="flex items-center justify-center px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transform transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
            >
              <X size={20} className="mr-2" />
              Absent
            </button>
          </div>
        ) : (
          canUndo && (
            <button
              onClick={onUndo}
              className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transform transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
            >
              <Undo size={20} className="mr-2" />
              Undo
            </button>
          )
        )}
      </div>
    </div>
  );
}