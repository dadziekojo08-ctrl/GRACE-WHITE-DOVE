import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { AttendanceRecord, Student } from '../../types';
import {
  CheckSquare,
  QrCode,
  Check,
  X,
  Clock,
  AlertTriangle,
  Send,
  MessageSquare,
  Users,
  Search,
  Calendar,
  Sparkles,
  PhoneCall
} from 'lucide-react';

export const AttendanceManagement: React.FC<{ initialOpenScanner?: boolean }> = ({ initialOpenScanner }) => {
  const {
    students,
    attendance,
    markAttendance,
    bulkMarkAttendance,
    gateCheckIn,
    sendBroadcast
  } = useSchool();

  const [selectedClass, setSelectedClass] = useState<string>('JHS 2 (Grade 8)');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [scanInput, setScanInput] = useState<string>('');
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; student?: Student } | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(initialOpenScanner || false);

  const classStudents = students.filter((s) => s.className === selectedClass);

  // Get attendance status for a student for selected date
  const getStatusForStudent = (studentId: string): AttendanceRecord['status'] => {
    const record = attendance.find((a) => a.studentId === studentId && a.date === selectedDate);
    return record ? record.status : 'Present'; // Default to present if unmarked
  };

  const handleMarkOne = (studentId: string, status: AttendanceRecord['status']) => {
    markAttendance(studentId, status);
  };

  const handleMarkAllPresent = () => {
    const records = classStudents.map((s) => ({
      studentId: s.id,
      status: 'Present' as const,
      remarks: 'Bulk roll call'
    }));
    bulkMarkAttendance(records);
  };

  const handleGateScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;
    const res = gateCheckIn(scanInput);
    setScanResult(res);
    setScanInput('');
  };

  // Find absent students in selected class
  const absentStudents = classStudents.filter((s) => getStatusForStudent(s.id) === 'Absent');

  const handleSendAbsenteeAlerts = () => {
    absentStudents.forEach((std) => {
      sendBroadcast({
        channel: 'WhatsApp',
        recipient: std.guardianPhone,
        recipientName: std.guardianName,
        subject: 'Attendance Notification',
        message: `Dear ${std.guardianName}, your child ${std.firstName} ${std.lastName} was recorded absent from Grace White Dove School Complex on ${selectedDate}. If this is an excused absence, kindly reach out to school administration at 0244403541.`
      });
    });
    alert(`Dispatched automated WhatsApp / SMS absentee alerts to ${absentStudents.length} parent(s).`);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">Attendance Management</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Roll Call & Gate Scanner
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Conduct period roll calls, scan QR student ID cards at school gates, and notify parents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            Gate Barcode / QR Scanner
          </button>
        </div>
      </div>

      {/* Control Bar: Class selector, Date Picker, and Quick Mark */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Select Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="Primary 1 (Grade 1)">Primary 1 (Grade 1)</option>
              <option value="Primary 4 (Grade 4)">Primary 4 (Grade 4)</option>
              <option value="Primary 6 (Grade 6)">Primary 6 (Grade 6)</option>
              <option value="JHS 1 (Grade 7)">JHS 1 (Grade 7)</option>
              <option value="JHS 2 (Grade 8)">JHS 2 (Grade 8)</option>
              <option value="JHS 3 (Grade 9)">JHS 3 (Grade 9)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllPresent}
            className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            Mark All Present
          </button>
          {absentStudents.length > 0 && (
            <button
              onClick={handleSendAbsenteeAlerts}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Notify {absentStudents.length} Absent Parents
            </button>
          )}
        </div>
      </div>

      {/* Classroom Roll Call Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-xs text-slate-900">{selectedClass} Attendance Register</h3>
            <span className="text-[11px] text-slate-500 font-mono">({classStudents.length} Students)</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="text-emerald-700">
              Present: {classStudents.filter((s) => getStatusForStudent(s.id) === 'Present').length}
            </span>
            <span className="text-amber-700">
              Late: {classStudents.filter((s) => getStatusForStudent(s.id) === 'Late').length}
            </span>
            <span className="text-red-700">
              Absent: {classStudents.filter((s) => getStatusForStudent(s.id) === 'Absent').length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-emerald-900 text-white uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-4">Roll</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Admission #</th>
                <th className="py-3 px-4">Parent Phone</th>
                <th className="py-3 px-4 text-center">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map((std) => {
                const currentStatus = getStatusForStudent(std.id);
                return (
                  <tr key={std.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">{std.rollNo}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={std.photoUrl}
                          alt={std.firstName}
                          className="w-8 h-8 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="font-bold text-slate-900">
                          {std.firstName} {std.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-900">{std.admissionNo}</td>
                    <td className="py-3 px-4 text-slate-600">{std.guardianPhone}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleMarkOne(std.id, 'Present')}
                          className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                            currentStatus === 'Present'
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-emerald-100 text-slate-600'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => handleMarkOne(std.id, 'Late')}
                          className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                            currentStatus === 'Late'
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'bg-slate-100 hover:bg-amber-100 text-slate-600'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          onClick={() => handleMarkOne(std.id, 'Absent')}
                          className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                            currentStatus === 'Absent'
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-red-100 text-slate-600'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => handleMarkOne(std.id, 'Excused')}
                          className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                            currentStatus === 'Excused'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-blue-100 text-slate-600'
                          }`}
                        >
                          Excused
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gate Scanner Modal Simulation */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base font-['Outfit']">Gate Attendance Scanner</h3>
              </div>
              <button
                onClick={() => setIsScannerOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-emerald-900 text-white rounded-xl text-center relative overflow-hidden">
                <div className="w-24 h-24 border-2 border-dashed border-amber-400/80 rounded-xl mx-auto flex items-center justify-center mb-2 animate-pulse">
                  <QrCode className="w-12 h-12 text-amber-300" />
                </div>
                <p className="text-xs text-emerald-200">Point Scanner or Enter Student Admission # / Name</p>
              </div>

              <form onSubmit={handleGateScan} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    autoFocus
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    className="flex-1 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 font-mono outline-none focus:ring-2 focus:ring-emerald-600"
                    placeholder="e.g. ADM-2026-101 or Kwaku"
                  />
                  <button
                    type="submit"
                    className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Scan
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span>Quick Test:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setScanInput('ADM-2026-101');
                    }}
                    className="text-emerald-700 underline font-mono cursor-pointer"
                  >
                    ADM-2026-101
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setScanInput('ADM-2026-102');
                    }}
                    className="text-emerald-700 underline font-mono cursor-pointer"
                  >
                    ADM-2026-102
                  </button>
                </div>
              </form>

              {scanResult && (
                <div
                  className={`p-3.5 rounded-xl border ${
                    scanResult.success
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-red-50 border-red-300 text-red-900'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {scanResult.success ? (
                      <Check className="w-4 h-4 text-emerald-700 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-red-700 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold">{scanResult.message}</p>
                      {scanResult.student && (
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          Parent: {scanResult.student.guardianName} ({scanResult.student.guardianPhone})
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
