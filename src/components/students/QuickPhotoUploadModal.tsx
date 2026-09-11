import React, { useState } from 'react';
import { Student } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { StudentPhotoUpload } from './StudentPhotoUpload';
import {
  X,
  CreditCard,
  CheckCircle2,
  Sparkles,
  Shield,
  Printer
} from 'lucide-react';

interface QuickPhotoUploadModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onOpenIdCard?: (student: Student) => void;
}

export const QuickPhotoUploadModal: React.FC<QuickPhotoUploadModalProps> = ({
  student,
  isOpen,
  onClose,
  onOpenIdCard
}) => {
  const { updateStudent } = useSchool();
  const [photoUrl, setPhotoUrl] = useState<string>(student.photoUrl || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    setIsSaving(true);
    updateStudent(student.id, { photoUrl });
    setSuccessMessage('Student photo successfully saved! ID Card updated.');

    setTimeout(() => {
      setIsSaving(false);
      setSuccessMessage(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-['Outfit']">Student ID Photo Upload</h3>
              <p className="text-xs text-emerald-200">
                {student.firstName} {student.lastName} • {student.className} ({student.admissionNo})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Photo Uploader Component */}
          <StudentPhotoUpload
            currentPhotoUrl={photoUrl}
            studentName={`${student.firstName} ${student.lastName}`}
            onPhotoChange={(newUrl) => setPhotoUrl(newUrl)}
            label="Upload or Snap Pupil Photo"
            helperText="Clear front-facing passport portrait ensures high-resolution ID card printing."
          />

          {/* ID Card Live Preview Peek */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-950 p-4 rounded-xl text-white shadow-inner flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-16 rounded-lg overflow-hidden border-2 border-amber-400 bg-slate-800 shadow-md shrink-0">
                <img
                  src={photoUrl || student.photoUrl}
                  alt={student.firstName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-amber-300 uppercase tracking-wider block">
                  ID Card Print Preview
                </span>
                <p className="text-sm font-bold text-white truncate max-w-[200px]">
                  {student.firstName} {student.lastName}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-emerald-200">
                  <span className="font-mono">{student.admissionNo}</span>
                  <span>•</span>
                  <span>{student.className}</span>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-[10px] text-amber-300 font-bold bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/40">
                Official Credential
              </span>
              <span className="text-[10px] text-emerald-300 mt-1">High-Resolution 300 DPI</span>
            </div>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
            {onOpenIdCard && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenIdCard(student);
                }}
                className="w-full sm:w-auto px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-amber-700" />
                Preview Full ID Card
              </button>
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {isSaving ? 'Saving...' : 'Save to Student Record'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
