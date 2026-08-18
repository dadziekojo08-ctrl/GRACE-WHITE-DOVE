import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Exam, ExamSchedule, MarkEntry, Student } from '../../types';
import {
  Award,
  Calendar,
  Edit,
  Plus,
  Printer,
  Search,
  CheckCircle,
  FileSpreadsheet,
  BarChart,
  User,
  GraduationCap,
  X
} from 'lucide-react';

export const ExamManagement: React.FC = () => {
  const { exams, addExam, examSchedules, marks, bulkRecordMarks, students, academicYear, currentTerm } = useSchool();

  const [activeTab, setActiveTab] = useState<'schedules' | 'marks-entry' | 'report-card'>('marks-entry');
  const [selectedExam, setSelectedExam] = useState<string>(exams[0]?.id || '');
  const [selectedClass, setSelectedClass] = useState<string>('JHS 2 (Grade 8)');
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');

  // Report Card State
  const [reportStudentId, setReportStudentId] = useState<string>(students[0]?.id || '');

  // Marks inputs state
  const classStudents = students.filter((s) => s.className === selectedClass);
  const [tempScores, setTempScores] = useState<Record<string, { classScore: number; examScore: number }>>({});

  const calculateGrade = (total: number): string => {
    if (total >= 80) return '1 - Excellent (A)';
    if (total >= 70) return '2 - Very Good (B+)';
    if (total >= 60) return '3 - Good (B)';
    if (total >= 50) return '4 - Credit (C)';
    if (total >= 40) return '5 - Pass (D)';
    return '9 - Fail (F)';
  };

  const handleScoreChange = (studentId: string, type: 'classScore' | 'examScore', val: number) => {
    setTempScores((prev) => ({
      ...prev,
      [studentId]: {
        classScore: type === 'classScore' ? val : prev[studentId]?.classScore || 0,
        examScore: type === 'examScore' ? val : prev[studentId]?.examScore || 0
      }
    }));
  };

  const handleSaveMarks = () => {
    const newMarks: Omit<MarkEntry, 'id'>[] = classStudents.map((std) => {
      const entry = tempScores[std.id] || { classScore: 0, examScore: 0 };
      const classScore = entry.classScore;
      const examScore = entry.examScore;
      const totalScore = Math.min(100, classScore + examScore);
      return {
        examId: selectedExam,
        studentId: std.id,
        studentName: `${std.firstName} ${std.lastName}`,
        className: selectedClass,
        subject: selectedSubject,
        classScore,
        examScore,
        score: totalScore,
        grade: calculateGrade(totalScore),
        remarks: totalScore >= 75 ? 'Outstanding analytical grasp' : totalScore >= 50 ? 'Satisfactory effort' : 'Requires improvement'
      };
    });

    bulkRecordMarks(newMarks);
    alert(`Successfully committed marks for ${newMarks.length} students in ${selectedSubject}!`);
  };

  const currentReportStudent = students.find((s) => s.id === reportStudentId) || students[0];
  const studentMarks = marks.filter((m) => m.studentId === currentReportStudent?.id);
  const averageScore =
    studentMarks.length > 0
      ? Math.round(studentMarks.reduce((acc, curr) => acc + curr.score, 0) / studentMarks.length)
      : 84;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">Exam Management & Report Cards</h2>
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Automated Grading
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Publish examination timetables, record term marks, and generate comprehensive student report cards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('report-card')}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            Generate Report Card
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl text-xs font-bold gap-6">
        <button
          onClick={() => setActiveTab('marks-entry')}
          className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'marks-entry'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Edit className="w-4 h-4" />
          Marks Entry & Score Sheet
        </button>
        <button
          onClick={() => setActiveTab('schedules')}
          className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'schedules'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Exam Schedules & Timetables
        </button>
        <button
          onClick={() => setActiveTab('report-card')}
          className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'report-card'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          Terminal Student Report Card
        </button>
      </div>

      {/* Tab 1: Marks Entry */}
      {activeTab === 'marks-entry' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <span className="font-semibold text-slate-600 mr-2">Exam:</span>
                <select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800"
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.title} ({ex.term})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="font-semibold text-slate-600 mr-2">Class:</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800"
                >
                  <option value="Primary 1 (Grade 1)">Primary 1 (Grade 1)</option>
                  <option value="Primary 4 (Grade 4)">Primary 4 (Grade 4)</option>
                  <option value="Primary 6 (Grade 6)">Primary 6 (Grade 6)</option>
                  <option value="JHS 1 (Grade 7)">JHS 1 (Grade 7)</option>
                  <option value="JHS 2 (Grade 8)">JHS 2 (Grade 8)</option>
                  <option value="JHS 3 (Grade 9)">JHS 3 (Grade 9)</option>
                </select>
              </div>

              <div>
                <span className="font-semibold text-slate-600 mr-2">Subject:</span>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-emerald-950"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Integrated Science">Integrated Science</option>
                  <option value="English Language">English Language</option>
                  <option value="Social Studies">Social Studies</option>
                  <option value="ICT & Computing">ICT & Computing</option>
                  <option value="French Language">French Language</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSaveMarks}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-amber-300" />
              Save & Commit Marks
            </button>
          </div>

          {/* Marks Entry Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-emerald-900 text-white uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-3 px-4">Roll</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Admission #</th>
                    <th className="py-3 px-4">Class Work (30%)</th>
                    <th className="py-3 px-4">Exam (70%)</th>
                    <th className="py-3 px-4">Total (100%)</th>
                    <th className="py-3 px-4">Grade & Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.map((std) => {
                    const existing = marks.find(
                      (m) => m.studentId === std.id && m.subject === selectedSubject && m.examId === selectedExam
                    );
                    const classSc = tempScores[std.id]?.classScore ?? existing?.classScore ?? 26;
                    const examSc = tempScores[std.id]?.examScore ?? existing?.examScore ?? 58;
                    const totalSc = Math.min(100, classSc + examSc);

                    return (
                      <tr key={std.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-500">{std.rollNo}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {std.firstName} {std.lastName}
                        </td>
                        <td className="py-3 px-4 font-mono text-emerald-950 font-semibold">{std.admissionNo}</td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min={0}
                            max={30}
                            value={classSc}
                            onChange={(e) => handleScoreChange(std.id, 'classScore', Number(e.target.value))}
                            className="w-20 border border-slate-300 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min={0}
                            max={70}
                            value={examSc}
                            onChange={(e) => handleScoreChange(std.id, 'examScore', Number(e.target.value))}
                            className="w-20 border border-slate-300 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                          />
                        </td>
                        <td className="py-3 px-4 font-black font-mono text-emerald-800 text-sm">{totalSc}%</td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{calculateGrade(totalSc)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Schedules */}
      {activeTab === 'schedules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {examSchedules.map((sch) => (
            <div key={sch.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{sch.subject} Paper</h3>
                  <span className="text-xs text-emerald-700 font-semibold">{sch.className}</span>
                </div>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded">
                  Max Marks: {sch.maxMarks}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Date:</span>
                  <span className="font-bold font-mono">{sch.date}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Time:</span>
                  <span className="font-bold">{sch.startTime} - {sch.endTime}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Examination Hall:</span>
                  <span className="font-semibold text-emerald-800">{sch.room}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Official Printable Report Card */}
      {activeTab === 'report-card' && (
        <div className="space-y-4">
          {/* Student Selector Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Choose Student to Generate Report:</span>
              <select
                value={reportStudentId}
                onChange={(e) => setReportStudentId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-900"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} ({s.className})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              Print Official Report Card
            </button>
          </div>

          {/* Printable Report Card Layout */}
          <div className="bg-white rounded-2xl border-2 border-emerald-900 p-8 shadow-lg max-w-3xl mx-auto text-xs space-y-6">
            {/* Header / Crest */}
            <div className="text-center border-b-2 border-emerald-900 pb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-400 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-emerald-950 uppercase tracking-tight font-['Outfit']">
                  Grace White Dove School Complex
                </h1>
              </div>
              <p className="text-slate-600 text-xs">Email: gracewhitedoveschool@gmail.com • Tel: 0244403541</p>
              <p className="font-bold text-amber-900 mt-1 uppercase tracking-widest text-[11px]">
                Terminal Academic Assessment Report Card
              </p>
            </div>

            {/* Student Particulars Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Student Name</span>
                <span className="font-black text-slate-900 text-sm">
                  {currentReportStudent.firstName} {currentReportStudent.lastName}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Admission #</span>
                <span className="font-mono font-bold text-slate-900">{currentReportStudent.admissionNo}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Class & Section</span>
                <span className="font-bold text-slate-900">{currentReportStudent.className} (Sec {currentReportStudent.section})</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Academic Session</span>
                <span className="font-bold text-slate-900">{academicYear} • {currentTerm}</span>
              </div>
            </div>

            {/* Assessment Scores Table */}
            <table className="w-full text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-emerald-900 text-white uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 border border-emerald-900">Subject</th>
                  <th className="py-2.5 px-3 border border-emerald-900 text-center">Class (30%)</th>
                  <th className="py-2.5 px-3 border border-emerald-900 text-center">Exam (70%)</th>
                  <th className="py-2.5 px-3 border border-emerald-900 text-center">Total (100%)</th>
                  <th className="py-2.5 px-3 border border-emerald-900 text-center">Grade</th>
                  <th className="py-2.5 px-3 border border-emerald-900">Teacher's Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {studentMarks.map((m) => (
                  <tr key={m.id}>
                    <td className="py-2 px-3 font-bold text-slate-900 border border-slate-200">{m.subject}</td>
                    <td className="py-2 px-3 text-center font-mono border border-slate-200">{m.classScore}</td>
                    <td className="py-2 px-3 text-center font-mono border border-slate-200">{m.examScore}</td>
                    <td className="py-2 px-3 text-center font-black font-mono text-emerald-900 border border-slate-200">
                      {m.score}%
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-amber-900 border border-slate-200">{m.grade}</td>
                    <td className="py-2 px-3 text-slate-600 border border-slate-200 italic text-[11px]">{m.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Performance Summary & Remarks */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-slate-300 rounded-xl p-3.5 space-y-1.5">
                <span className="font-bold text-emerald-950 block">Class Teacher's Remark:</span>
                <p className="text-slate-700 italic">
                  "A highly disciplined and studious student with consistent intellectual drive. Well done!"
                </p>
                <div className="pt-2 text-[10px] text-slate-400">Signature: ____________________</div>
              </div>
              <div className="border border-slate-300 rounded-xl p-3.5 space-y-1.5">
                <span className="font-bold text-emerald-950 block">Headmaster's Recommendation:</span>
                <p className="text-slate-700 italic">
                  "Promoted to next term with academic commendation. Excellent conduct throughout the term."
                </p>
                <div className="pt-2 text-[10px] text-slate-400">Official Stamp: [SEAL AFFIXED]</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
