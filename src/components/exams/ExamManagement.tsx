import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Exam, ExamSchedule, MarkEntry, Student } from '../../types';
import {
  Award,
  Calendar,
  Edit,
  Printer,
  CheckCircle,
  BarChart,
  GraduationCap,
  Info,
  ChevronDown,
  ChevronUp,
  BookOpen,
  HelpCircle,
  Sparkles,
  Layers
} from 'lucide-react';
import {
  JHS_GRADING_SCHEME,
  LOWER_PRIMARY_GRADING_SCHEME,
  OTHER_GRADES_INFO,
  calculateJHSGrade,
  calculateLowerPrimaryGrade,
  calculateGradeForClass,
  calculateJHSGPA,
  isLowerPrimaryOrPreschool
} from '../../utils/jhsGrading';

export const ExamManagement: React.FC = () => {
  const { exams, addExam, examSchedules, marks, bulkRecordMarks, students, academicYear, currentTerm } = useSchool();

  const [activeTab, setActiveTab] = useState<'marks-entry' | 'schedules' | 'report-card' | 'grading-scheme'>('marks-entry');
  const [selectedExam, setSelectedExam] = useState<string>(exams[0]?.id || 'term-exam-01');
  const [selectedClass, setSelectedClass] = useState<string>('Primary 2 (Grade 2)');
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [showSchemeReference, setShowSchemeReference] = useState<boolean>(true);
  const [activeSchemeTab, setActiveSchemeTab] = useState<'lower-primary' | 'jhs-upper'>('lower-primary');

  // Report Card State
  const [reportStudentId, setReportStudentId] = useState<string>(students[0]?.id || '');
  const [reportClassFilter, setReportClassFilter] = useState<string>('All');

  // Check if active selected class is Pre-School / Lower Primary
  const isCurrentClassLowerPrimary = isLowerPrimaryOrPreschool(selectedClass);

  // Marks inputs state for active class & subject
  const classStudents = students.filter((s) => s.className === selectedClass);
  const [tempScores, setTempScores] = useState<
    Record<string, { rawScore: number; specialStatus?: 'None' | 'IC' | 'Audit'; remarks?: string }>
  >({});

  const handleScoreChange = (
    studentId: string,
    field: 'rawScore' | 'specialStatus' | 'remarks',
    val: any
  ) => {
    setTempScores((prev) => {
      const current = prev[studentId] || { rawScore: 85, specialStatus: 'None', remarks: '' };
      return {
        ...prev,
        [studentId]: {
          ...current,
          [field]: val
        }
      };
    });
  };

  const handleSaveMarks = () => {
    const newMarks: Omit<MarkEntry, 'id'>[] = classStudents.map((std) => {
      const existing = marks.find(
        (m) => m.studentId === std.id && m.subject === selectedSubject && (m.examId === selectedExam || !m.examId)
      );
      const entry = tempScores[std.id];
      const rawScore = entry?.rawScore ?? existing?.totalScore ?? existing?.score ?? 85;
      const specialStatus = entry?.specialStatus ?? (existing?.specialStatus as any) ?? 'None';
      const totalScore = Math.min(100, Math.max(0, rawScore));
      
      const gradeResult = calculateGradeForClass(totalScore, selectedClass, specialStatus);
      
      let defaultRemark = '';
      if (specialStatus === 'IC') {
        defaultRemark = 'Incomplete assessment - pending required makeup';
      } else if (specialStatus === 'Audit') {
        defaultRemark = 'Audited coursework';
      } else if (isCurrentClassLowerPrimary) {
        if (totalScore >= 92) defaultRemark = 'Distinction - Exemplary conceptual understanding and neat presentation';
        else if (totalScore >= 85) defaultRemark = 'Excellent - High aptitude and steady focus';
        else if (totalScore >= 78) defaultRemark = 'Very Good - Shows great curiosity and solid mastery';
        else if (totalScore >= 71) defaultRemark = 'Good - Active learner with commendable effort';
        else if (totalScore >= 64) defaultRemark = 'Average - Capable of higher performance with guidance';
        else if (totalScore >= 57) defaultRemark = 'Fair - Steady progress; practice recommended';
        else if (totalScore >= 50) defaultRemark = 'Barely Satisfactory - Needs closer supervision';
        else if (totalScore >= 43) defaultRemark = 'Pass - Basic threshold achieved; needs remedial work';
        else if (totalScore >= 36) defaultRemark = 'Weak Pass - Intensive support required';
        else defaultRemark = 'Requires urgent teacher-parent remedial intervention';
      } else {
        if (totalScore >= 80) defaultRemark = 'Outstanding analytical grasp & exemplary performance';
        else if (totalScore >= 75) defaultRemark = 'Very good mastery of key subject concepts';
        else if (totalScore >= 70) defaultRemark = 'Good comprehension and steady academic effort';
        else if (totalScore >= 65) defaultRemark = 'Average grasp; with sustained focus can attain higher ranks';
        else if (totalScore >= 60) defaultRemark = 'Fair performance; needs more regular practice';
        else if (totalScore >= 55) defaultRemark = 'Barely satisfactory; requires closer academic supervision';
        else if (totalScore >= 50) defaultRemark = 'Weak pass; targeted remedial support strongly recommended';
        else defaultRemark = 'Failed to meet minimum passing threshold; urgent intervention required';
      }

      const userRemarks = entry?.remarks || existing?.remarks || defaultRemark;

      return {
        examId: selectedExam,
        studentId: std.id,
        studentName: `${std.firstName} ${std.lastName}`,
        className: selectedClass,
        subject: selectedSubject,
        subjectName: selectedSubject,
        score: totalScore,
        totalScore,
        grade: gradeResult.grade,
        gradePoint: gradeResult.gradePoint,
        interpretation: gradeResult.interpretation,
        specialStatus,
        remarks: userRemarks,
        remark: userRemarks
      };
    });

    bulkRecordMarks(newMarks);
    alert(`Successfully committed marks for ${newMarks.length} students in ${selectedSubject}!`);
  };

  const fallbackReportStudent: Student = {
    id: 'std-demo-01',
    admissionNo: 'GWD-2025-089',
    firstName: 'Kwame',
    lastName: 'Mensah',
    gender: 'Male',
    dateOfBirth: '2016-04-12',
    classId: 'cls-pri2',
    className: 'Primary 2 (Grade 2)',
    classTeacher: 'Mrs. Grace Annan',
    section: 'A',
    rollNo: '04',
    guardianName: 'Mr. Kofi Mensah',
    guardianPhone: '0244123456',
    guardianEmail: 'kofi.mensah@gmail.com',
    address: 'Accra, Ghana',
    photoUrl: '',
    status: 'Active',
    joinedDate: '2023-09-01',
    balanceDue: 0
  };

  // Selected student for report card
  const filteredStudentsForReport = reportClassFilter === 'All' 
    ? students 
    : students.filter((s) => s.className === reportClassFilter);

  const currentReportStudent =
    students.find((s) => s.id === reportStudentId) ||
    filteredStudentsForReport[0] ||
    students[0] ||
    fallbackReportStudent;

  const isStudentLowerPrimary = isLowerPrimaryOrPreschool(currentReportStudent?.className);
  
  // Marks for this student
  const rawStudentMarks = marks.filter((m) => m.studentId === currentReportStudent?.id);
  
  // Dynamic fallback demo marks matching the student's level
  const defaultDemoMarksLowerPrimary: MarkEntry[] = [
    {
      id: 'demo-lp-1',
      examId: selectedExam,
      studentId: currentReportStudent?.id || 'demo',
      studentName: `${currentReportStudent?.firstName} ${currentReportStudent?.lastName}`,
      className: currentReportStudent?.className || 'Primary 2 (Grade 2)',
      subject: 'Mathematics',
      score: 94,
      totalScore: 94,
      grade: '1ST',
      gradePoint: 4.0,
      interpretation: 'DISTINCTION',
      remarks: 'Brilliant understanding of numbers, addition, and mental math.'
    },
    {
      id: 'demo-lp-2',
      examId: selectedExam,
      studentId: currentReportStudent?.id || 'demo',
      studentName: `${currentReportStudent?.firstName} ${currentReportStudent?.lastName}`,
      className: currentReportStudent?.className || 'Primary 2 (Grade 2)',
      subject: 'English Language',
      score: 88,
      totalScore: 88,
      grade: '2ND',
      gradePoint: 3.8,
      interpretation: 'EXCELLENT',
      remarks: 'Impressive phonics, reading fluency, and handwriting.'
    },
    {
      id: 'demo-lp-3',
      examId: selectedExam,
      studentId: currentReportStudent?.id || 'demo',
      studentName: `${currentReportStudent?.firstName} ${currentReportStudent?.lastName}`,
      className: currentReportStudent?.className || 'Primary 2 (Grade 2)',
      subject: 'Natural Science',
      score: 91,
      totalScore: 91,
      grade: '2ND',
      gradePoint: 3.8,
      interpretation: 'EXCELLENT',
      remarks: 'Very observant and curious about nature and living things.'
    },
    {
      id: 'demo-lp-4',
      examId: selectedExam,
      studentId: currentReportStudent?.id || 'demo',
      studentName: `${currentReportStudent?.firstName} ${currentReportStudent?.lastName}`,
      className: currentReportStudent?.className || 'Primary 2 (Grade 2)',
      subject: 'Our World Our People',
      score: 82,
      totalScore: 82,
      grade: '3RD',
      gradePoint: 3.5,
      interpretation: 'VERY GOOD',
      remarks: 'Good grasp of family values, community, and civics.'
    },
    {
      id: 'demo-lp-5',
      examId: selectedExam,
      studentId: currentReportStudent?.id || 'demo',
      studentName: `${currentReportStudent?.firstName} ${currentReportStudent?.lastName}`,
      className: currentReportStudent?.className || 'Primary 2 (Grade 2)',
      subject: 'Religious & Moral Education',
      score: 86,
      totalScore: 86,
      grade: '2ND',
      gradePoint: 3.8,
      interpretation: 'EXCELLENT',
      remarks: 'Demonstrates outstanding moral discipline and respect.'
    },
    {
      id: 'demo-lp-6',
      examId: selectedExam,
      studentId: currentReportStudent?.id || 'demo',
      studentName: `${currentReportStudent?.firstName} ${currentReportStudent?.lastName}`,
      className: currentReportStudent?.className || 'Primary 2 (Grade 2)',
      subject: 'Creative Arts & Craft',
      score: 95,
      totalScore: 95,
      grade: '1ST',
      gradePoint: 4.0,
      interpretation: 'DISTINCTION',
      remarks: 'Exceptional artistic expression, coloring, and craft projects.'
    },
    {
      id: 'demo-lp-7',
      examId: selectedExam,
      studentId: currentReportStudent?.id || 'demo',
      studentName: `${currentReportStudent?.firstName} ${currentReportStudent?.lastName}`,
      className: currentReportStudent?.className || 'Primary 2 (Grade 2)',
      subject: 'Computing (ICT)',
      score: 89,
      totalScore: 89,
      grade: '2ND',
      gradePoint: 3.8,
      interpretation: 'EXCELLENT',
      remarks: 'Quick learner with computer mouse and keyboard basics.'
    },
    {
      id: 'demo-lp-8',
      examId: selectedExam,
      studentId: currentReportStudent?.id || 'demo',
      studentName: `${currentReportStudent?.firstName} ${currentReportStudent?.lastName}`,
      className: currentReportStudent?.className || 'Primary 2 (Grade 2)',
      subject: 'Ghanaian Language (Twi)',
      score: 79,
      totalScore: 79,
      grade: '3RD',
      gradePoint: 3.5,
      interpretation: 'VERY GOOD',
      remarks: 'Good oral pronunciation and basic vocabulary.'
    }
  ];

  const defaultDemoMarksJHS: MarkEntry[] = [
    {
      id: 'demo-jhs-1',
      examId: selectedExam,
      studentId: currentReportStudent?.id || 'demo',
      studentName: `${currentReportStudent?.firstName} ${currentReportStudent?.lastName}`,
      className: currentReportStudent?.className || 'JHS 2 (Grade 8)',
      subject: 'Mathematics',
      score: 88,
      totalScore: 88,
      grade: 'A',
      gradePoint: 4.0,
      interpretation: 'Excellent',
      remarks: 'Outstanding analytical skills and exemplary problem solving'
    },
    {
      id: 'demo-jhs-2',
      examId: selectedExam,
      studentId: currentReportStudent?.id || 'demo',
      studentName: `${currentReportStudent?.firstName} ${currentReportStudent?.lastName}`,
      className: currentReportStudent?.className || 'JHS 2 (Grade 8)',
      subject: 'Integrated Science',
      score: 78,
      totalScore: 78,
      grade: 'B+',
      gradePoint: 3.5,
      interpretation: 'Very Good',
      remarks: 'Very good grasp of experimental principles and theory'
    },
    {
      id: 'demo-jhs-3',
      examId: selectedExam,
      studentId: currentReportStudent?.id || 'demo',
      studentName: `${currentReportStudent?.firstName} ${currentReportStudent?.lastName}`,
      className: currentReportStudent?.className || 'JHS 2 (Grade 8)',
      subject: 'English Language',
      score: 73,
      totalScore: 73,
      grade: 'B',
      gradePoint: 3.0,
      interpretation: 'Good',
      remarks: 'Commendable grammar and written expression'
    },
    {
      id: 'demo-jhs-4',
      examId: selectedExam,
      studentId: currentReportStudent?.id || 'demo',
      studentName: `${currentReportStudent?.firstName} ${currentReportStudent?.lastName}`,
      className: currentReportStudent?.className || 'JHS 2 (Grade 8)',
      subject: 'Social Studies',
      score: 67,
      totalScore: 67,
      grade: 'C+',
      gradePoint: 2.5,
      interpretation: 'Average',
      remarks: 'Satisfactory grasp of civic concepts; can improve with reading'
    },
    {
      id: 'demo-jhs-5',
      examId: selectedExam,
      studentId: currentReportStudent?.id || 'demo',
      studentName: `${currentReportStudent?.firstName} ${currentReportStudent?.lastName}`,
      className: currentReportStudent?.className || 'JHS 2 (Grade 8)',
      subject: 'Computing & ICT',
      score: 83,
      totalScore: 83,
      grade: 'A',
      gradePoint: 4.0,
      interpretation: 'Excellent',
      remarks: 'Exceptional digital aptitude and practical computing skills'
    },
    {
      id: 'demo-jhs-6',
      examId: selectedExam,
      studentId: currentReportStudent?.id || 'demo',
      studentName: `${currentReportStudent?.firstName} ${currentReportStudent?.lastName}`,
      className: currentReportStudent?.className || 'JHS 2 (Grade 8)',
      subject: 'French Language',
      score: 62,
      totalScore: 62,
      grade: 'C',
      gradePoint: 2.0,
      interpretation: 'Fair',
      remarks: 'Steady oral communication; requires additional vocabulary practice'
    }
  ];

  const studentMarks: MarkEntry[] = rawStudentMarks.length > 0 
    ? rawStudentMarks 
    : isStudentLowerPrimary 
    ? defaultDemoMarksLowerPrimary 
    : defaultDemoMarksJHS;

  // Calculate Cumulative Stats
  const gpaStats = calculateJHSGPA(
    studentMarks.map((m) => ({
      gradePoint: m.gradePoint,
      score: m.totalScore ?? m.score,
      specialStatus: m.specialStatus
    })),
    currentReportStudent?.className
  );

  const totalRawSum = studentMarks.reduce((acc, curr) => acc + (curr.totalScore ?? curr.score ?? 0), 0);
  const averagePercentage = studentMarks.length > 0 ? Math.round((totalRawSum / studentMarks.length) * 10) / 10 : 0;

  // Compute average overall position/grade for lower primary
  const averagePositionResult = isStudentLowerPrimary
    ? calculateLowerPrimaryGrade(averagePercentage)
    : calculateJHSGrade(averagePercentage);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">Exam Management & Report Cards</h2>
            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
              isCurrentClassLowerPrimary
                ? 'bg-amber-100 text-amber-950 border-amber-300'
                : 'bg-emerald-100 text-emerald-950 border-emerald-300'
            }`}>
              {isCurrentClassLowerPrimary ? 'Pre-School & Lower Primary Grading (Nursery – Basic 3)' : 'JHS Standard Grading (Basic 4 – JHS 3)'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dual official assessment system: Pre-School & Lower Primary (Nursery to Basic 3: 1ST Distinction to 10TH Fail) and JHS (Basic 4 to JHS 3: A to E with 4.0 GPA scale).
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
      <div className="flex flex-wrap border-b border-slate-200 bg-white px-4 rounded-xl text-xs font-bold gap-4 sm:gap-6">
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
          onClick={() => setActiveTab('grading-scheme')}
          className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'grading-scheme'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-700" />
          Official Grading Systems Reference
        </button>
      </div>

      {/* ========================================================================= */}
      {/* GRADING SCHEME QUICK REFERENCE BANNER (Collapsible) */}
      {/* ========================================================================= */}
      {showSchemeReference && activeTab !== 'grading-scheme' && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center text-xs font-black">
                ★
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 font-['Outfit']">
                  {isCurrentClassLowerPrimary
                    ? 'GRACE WHITE DOVE SCHOOL COMPLEX • PRE-SCHOOL & LOWER PRIMARY GRADING (NURSERY TO BASIC 3)'
                    : 'JHS & UPPER PRIMARY GRADING SYSTEM (BASIC 4 TO JHS 3)'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {isCurrentClassLowerPrimary
                    ? 'Raw score percentage conversion into official position rank (1ST to 10TH) and qualitative interpretation.'
                    : 'Raw score conversion into official Letter Grades (A to E) and Grade Points (4.0 to 0.0).'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSchemeReference(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              Hide <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>

          {isCurrentClassLowerPrimary ? (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 bg-white rounded-xl overflow-hidden">
                <thead className="bg-emerald-950 text-white font-bold uppercase text-[10px] border-b border-emerald-900">
                  <tr>
                    <th className="py-2.5 px-4">MARKS (%)</th>
                    <th className="py-2.5 px-4 text-center">POSITION / RANK</th>
                    <th className="py-2.5 px-4">INTERPRETATION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {LOWER_PRIMARY_GRADING_SCHEME.map((tier, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-4 font-mono font-bold text-slate-800">{tier.scoreRangeLabel}</td>
                      <td className="py-2 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded font-black text-xs border ${tier.badgeClass}`}>
                          {tier.position}
                        </span>
                      </td>
                      <td className="py-2 px-4 font-bold text-slate-800">{tier.interpretation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 bg-white rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Raw Score</th>
                    <th className="py-2 px-3 text-center">Grade</th>
                    <th className="py-2 px-3 text-center">Grade Point</th>
                    <th className="py-2 px-3">Interpretation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {JHS_GRADING_SCHEME.map((tier, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-1.5 px-3 font-bold text-slate-800">{tier.scoreRangeLabel}</td>
                      <td className="py-1.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded font-black text-xs ${tier.badgeClass}`}>
                          {tier.grade}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 text-center font-bold text-slate-900">{tier.gradePoint.toFixed(1)}</td>
                      <td className="py-1.5 px-3 font-sans font-medium text-slate-700">{tier.interpretation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: MARKS ENTRY & SCORE SHEET */}
      {/* ========================================================================= */}
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
                  <option value="term-exam-01">Terminal Examination ({currentTerm})</option>
                  <option value="mid-term-01">Mid-Term Assessment</option>
                  <option value="class-assessment-01">Monthly Class Assessment</option>
                  <option value="mock-jhs-01">JHS BECE Mock Examination</option>
                </select>
              </div>

              <div>
                <span className="font-semibold text-slate-600 mr-2">Class Level:</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800"
                >
                  <optgroup label="Pre-School (Nursery to KG)">
                    <option value="Creche">Creche</option>
                    <option value="Nursery 1">Nursery 1</option>
                    <option value="Nursery 2">Nursery 2</option>
                    <option value="Kindergarten 1 (KG 1)">Kindergarten 1 (KG 1)</option>
                    <option value="Kindergarten 2 (KG 2)">Kindergarten 2 (KG 2)</option>
                  </optgroup>
                  <optgroup label="Lower Primary (Basic 1 to Basic 3)">
                    <option value="Primary 1 (Grade 1)">Primary 1 (Grade 1 / Basic 1)</option>
                    <option value="Primary 2 (Grade 2)">Primary 2 (Grade 2 / Basic 2)</option>
                    <option value="Primary 3 (Grade 3)">Primary 3 (Grade 3 / Basic 3)</option>
                  </optgroup>
                  <optgroup label="Upper Primary (Basic 4 to Basic 6)">
                    <option value="Primary 4 (Grade 4)">Primary 4 (Grade 4 / Basic 4)</option>
                    <option value="Primary 5 (Grade 5)">Primary 5 (Grade 5 / Basic 5)</option>
                    <option value="Primary 6 (Grade 6)">Primary 6 (Grade 6 / Basic 6)</option>
                  </optgroup>
                  <optgroup label="Junior High School (JHS 1 to JHS 3)">
                    <option value="JHS 1 (Grade 7)">JHS 1 (Grade 7 / Basic 7)</option>
                    <option value="JHS 2 (Grade 8)">JHS 2 (Grade 8 / Basic 8)</option>
                    <option value="JHS 3 (Grade 9)">JHS 3 (Grade 9 / Basic 9)</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <span className="font-semibold text-slate-600 mr-2">Subject:</span>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-emerald-950"
                >
                  {isCurrentClassLowerPrimary ? (
                    <>
                      <option value="Mathematics">Mathematics (Numeracy)</option>
                      <option value="English Language">English Language (Literacy & Phonics)</option>
                      <option value="Natural Science">Natural Science</option>
                      <option value="Our World Our People">Our World Our People (OWOP)</option>
                      <option value="Religious & Moral Education (RME)">Religious & Moral Education (RME)</option>
                      <option value="Creative Arts & Craft">Creative Arts & Craft</option>
                      <option value="Computing (ICT)">Computing (ICT)</option>
                      <option value="Ghanaian Language (Twi)">Ghanaian Language (Twi)</option>
                      <option value="French Language">French Language</option>
                      <option value="Rhymes & Letter Sounds">Rhymes & Letter Sounds</option>
                    </>
                  ) : (
                    <>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Integrated Science">Integrated Science</option>
                      <option value="English Language">English Language</option>
                      <option value="Social Studies">Social Studies</option>
                      <option value="Computing & ICT">Computing & ICT</option>
                      <option value="French Language">French Language</option>
                      <option value="Religious & Moral Education (RME)">Religious & Moral Education (RME)</option>
                      <option value="Creative Arts & Design">Creative Arts & Design</option>
                      <option value="Career Technology">Career Technology</option>
                      <option value="Ghanaian Language & Culture">Ghanaian Language & Culture</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!showSchemeReference && (
                <button
                  type="button"
                  onClick={() => setShowSchemeReference(true)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                  Show Grading Key
                </button>
              )}
              <button
                onClick={handleSaveMarks}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4 text-amber-300" />
                Save & Commit Marks
              </button>
            </div>
          </div>

          {/* Marks Entry Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-emerald-950 text-white flex items-center justify-between text-xs">
              <span className="font-bold font-['Outfit']">
                Score Sheet: {selectedClass} • {selectedSubject}
              </span>
              <span className="text-amber-300 font-semibold">
                {isCurrentClassLowerPrimary
                  ? 'Pre-School & Lower Primary Conversion (1ST Distinction - 10TH Fail)'
                  : 'JHS Raw Score Conversion Scheme (80-100 A to Below 50 E)'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
                    <th className="py-3 px-3 w-14">Roll</th>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Admission #</th>
                    <th className="py-3 px-3 text-center font-black text-slate-900">Raw Score (0 - 100)</th>
                    {isCurrentClassLowerPrimary ? (
                      <th className="py-3 px-3 text-center">Position</th>
                    ) : (
                      <>
                        <th className="py-3 px-3 text-center">Grade</th>
                        <th className="py-3 px-3 text-center">Grade Point</th>
                      </>
                    )}
                    <th className="py-3 px-3">Interpretation</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Remarks / Appraisal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.map((std) => {
                    const existing = marks.find(
                      (m) => m.studentId === std.id && m.subject === selectedSubject
                    );
                    const rawSc = tempScores[std.id]?.rawScore ?? existing?.totalScore ?? existing?.score ?? 85;
                    const specialStatus = tempScores[std.id]?.specialStatus ?? (existing?.specialStatus as any) ?? 'None';
                    const totalSc = Math.min(100, Math.max(0, rawSc));
                    const gradeResult = calculateGradeForClass(totalSc, selectedClass, specialStatus);
                    const remarksVal = tempScores[std.id]?.remarks ?? existing?.remarks ?? '';

                    return (
                      <tr key={std.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-500">{std.rollNo || '—'}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {std.firstName} {std.lastName}
                        </td>
                        <td className="py-3 px-3 font-mono text-emerald-950 font-semibold">{std.admissionNo}</td>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={specialStatus === 'IC' || specialStatus === 'Audit' ? '' : rawSc}
                            placeholder={specialStatus === 'IC' ? 'IC' : specialStatus === 'Audit' ? 'AUDIT' : '0-100'}
                            disabled={specialStatus === 'IC' || specialStatus === 'Audit'}
                            onChange={(e) => handleScoreChange(std.id, 'rawScore', Number(e.target.value))}
                            className="w-20 border border-slate-300 rounded-lg px-2.5 py-1.5 text-center font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                          />
                        </td>
                        
                        {isCurrentClassLowerPrimary ? (
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2.5 py-0.5 rounded font-black text-xs border ${gradeResult.badgeClass}`}>
                              {gradeResult.position || gradeResult.grade}
                            </span>
                          </td>
                        ) : (
                          <>
                            <td className="py-3 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded font-black text-xs border ${gradeResult.badgeClass}`}>
                                {gradeResult.grade}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center font-black font-mono text-slate-800">
                              {gradeResult.gradePoint.toFixed(1)}
                            </td>
                          </>
                        )}

                        <td className="py-3 px-3 font-bold text-slate-800">
                          {gradeResult.interpretation}
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={specialStatus}
                            onChange={(e) => handleScoreChange(std.id, 'specialStatus', e.target.value)}
                            className="border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 font-semibold text-[11px]"
                          >
                            <option value="None">Regular</option>
                            <option value="IC">Incomplete (IC)</option>
                            <option value="Audit">Audit</option>
                          </select>
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            placeholder="Auto or custom appraisal"
                            value={remarksVal}
                            onChange={(e) => handleScoreChange(std.id, 'remarks', e.target.value)}
                            className="w-full min-w-[180px] border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 text-xs focus:ring-2 focus:ring-emerald-600 outline-none"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TERMINAL STUDENT REPORT CARD */}
      {/* ========================================================================= */}
      {activeTab === 'report-card' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <span className="font-semibold text-slate-600 mr-2">Filter Class:</span>
                <select
                  value={reportClassFilter}
                  onChange={(e) => setReportClassFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800"
                >
                  <option value="All">All School Classes</option>
                  <optgroup label="Pre-School & Lower Primary (Nursery - Basic 3)">
                    <option value="Creche">Creche</option>
                    <option value="Nursery 1">Nursery 1</option>
                    <option value="Nursery 2">Nursery 2</option>
                    <option value="Kindergarten 1 (KG 1)">Kindergarten 1 (KG 1)</option>
                    <option value="Kindergarten 2 (KG 2)">Kindergarten 2 (KG 2)</option>
                    <option value="Primary 1 (Grade 1)">Primary 1 (Grade 1)</option>
                    <option value="Primary 2 (Grade 2)">Primary 2 (Grade 2)</option>
                    <option value="Primary 3 (Grade 3)">Primary 3 (Grade 3)</option>
                  </optgroup>
                  <optgroup label="Upper Primary & JHS (Basic 4 - JHS 3)">
                    <option value="Primary 4 (Grade 4)">Primary 4 (Grade 4)</option>
                    <option value="Primary 5 (Grade 5)">Primary 5 (Grade 5)</option>
                    <option value="Primary 6 (Grade 6)">Primary 6 (Grade 6)</option>
                    <option value="JHS 1 (Grade 7)">JHS 1 (Grade 7)</option>
                    <option value="JHS 2 (Grade 8)">JHS 2 (Grade 8)</option>
                    <option value="JHS 3 (Grade 9)">JHS 3 (Grade 9)</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <span className="font-semibold text-slate-600 mr-2">Select Student:</span>
                <select
                  value={reportStudentId}
                  onChange={(e) => setReportStudentId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-900 max-w-xs"
                >
                  {filteredStudentsForReport.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.className}) - Roll: {s.rollNo || '00'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              Print Official Report Card
            </button>
          </div>

          {/* ============================================================= */}
          {/* PRINTABLE OFFICIAL TERMINAL REPORT CARD SHEET */}
          {/* ============================================================= */}
          <div className="bg-white rounded-3xl border-2 border-emerald-950 p-6 sm:p-10 shadow-xl max-w-4xl mx-auto text-xs space-y-6 print:border-none print:shadow-none print:p-0 print:m-0 relative">
            {/* 1. Official Header & School Identity */}
            <div className="border-b-2 border-emerald-950 pb-5 text-center relative">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-950 text-amber-400 flex items-center justify-center font-black shadow-md border-2 border-amber-400">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-xl sm:text-3xl font-black text-emerald-950 uppercase tracking-tight font-['Outfit']">
                    Grace White Dove School Complex
                  </h1>
                  <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">
                    Official Terminal Student Continuous Assessment & Evaluation Report
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Tel: 0244403541 | Email: gracewhitedoveschool@gmail.com | Accra, Ghana
                  </p>
                </div>
              </div>

              <div className="inline-block bg-emerald-950 text-amber-400 text-[11px] font-black uppercase px-4 py-1 rounded-full tracking-widest mt-1">
                {isStudentLowerPrimary 
                  ? `Pre-School & Lower Primary Academic Transcript • ${currentTerm} (${academicYear})`
                  : `JHS Standard Academic Performance Transcript • ${currentTerm} (${academicYear})`}
              </div>
            </div>

            {/* 2. Student Particulars Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-300">
              <div>
                <span className="text-emerald-900 block text-[10px] uppercase font-bold">Student Name</span>
                <span className="font-black text-slate-900 text-sm">
                  {currentReportStudent.firstName} {currentReportStudent.lastName}
                </span>
              </div>
              <div>
                <span className="text-emerald-900 block text-[10px] uppercase font-bold">Admission Number</span>
                <span className="font-mono font-bold text-slate-900">{currentReportStudent.admissionNo}</span>
              </div>
              <div>
                <span className="text-emerald-900 block text-[10px] uppercase font-bold">Class & Section</span>
                <span className="font-extrabold text-emerald-950">
                  {currentReportStudent.className} (Sec {currentReportStudent.section || 'A'})
                </span>
              </div>
              <div>
                <span className="text-emerald-900 block text-[10px] uppercase font-bold">Roll / Position</span>
                <span className="font-bold text-slate-900">
                  Roll #{currentReportStudent.rollNo || '01'}
                </span>
              </div>
            </div>

            {/* 3. Academic KPI Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {isStudentLowerPrimary ? (
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Overall Rank / Position</span>
                  <span className="text-2xl font-black text-emerald-950 font-['Outfit']">
                    {averagePositionResult.position}
                  </span>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Cumulative GPA</span>
                  <span className="text-2xl font-black text-emerald-950 font-mono font-['Outfit']">
                    {gpaStats.formattedGpa} <span className="text-xs text-slate-400">/ 4.00</span>
                  </span>
                </div>
              )}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Average Raw Score</span>
                <span className="text-2xl font-black text-emerald-950 font-mono font-['Outfit']">
                  {averagePercentage}%
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Subjects Assessed</span>
                <span className="text-2xl font-black text-emerald-950 font-mono font-['Outfit']">
                  {studentMarks.length}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Overall Standing</span>
                <span className="text-xs font-black text-emerald-800 block mt-1">
                  {averagePositionResult.interpretation}
                </span>
              </div>
            </div>

            {/* 4. Detailed Assessment Breakdown Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-emerald-950 text-white uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-2.5 px-3 border border-emerald-900">Subject Name</th>
                    <th className="py-2.5 px-3 border border-emerald-900 text-center">Raw Score</th>
                    {isStudentLowerPrimary ? (
                      <th className="py-2.5 px-3 border border-emerald-900 text-center">Position</th>
                    ) : (
                      <>
                        <th className="py-2.5 px-3 border border-emerald-900 text-center">Grade</th>
                        <th className="py-2.5 px-3 border border-emerald-900 text-center">Grade Point</th>
                      </>
                    )}
                    <th className="py-2.5 px-3 border border-emerald-900 text-center">Interpretation</th>
                    <th className="py-2.5 px-3 border border-emerald-900">Teacher's Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {studentMarks.map((m, idx) => {
                    const rawTotal = m.totalScore ?? m.score;
                    const gradeInfo = calculateGradeForClass(rawTotal, currentReportStudent?.className, m.specialStatus);

                    return (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                        <td className="py-2.5 px-3 font-bold text-slate-900 border border-slate-200">{m.subject || m.subjectName}</td>
                        <td className="py-2.5 px-3 text-center font-black font-mono text-emerald-950 border border-slate-200">
                          {m.specialStatus === 'IC' ? 'IC' : m.specialStatus === 'Audit' ? 'AUDIT' : `${rawTotal}%`}
                        </td>
                        
                        {isStudentLowerPrimary ? (
                          <td className="py-2.5 px-3 text-center font-black border border-slate-200">
                            <span className={`px-2.5 py-0.5 rounded text-[11px] font-black border ${gradeInfo.badgeClass}`}>
                              {gradeInfo.position || gradeInfo.grade}
                            </span>
                          </td>
                        ) : (
                          <>
                            <td className="py-2.5 px-3 text-center font-black border border-slate-200">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-black border ${gradeInfo.badgeClass}`}>
                                {gradeInfo.grade}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900 border border-slate-200">
                              {gradeInfo.gradePoint.toFixed(1)}
                            </td>
                          </>
                        )}

                        <td className="py-2.5 px-3 text-center font-bold text-slate-900 border border-slate-200 text-[11px]">
                          {gradeInfo.interpretation}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 border border-slate-200 italic text-[11px]">
                          {m.remarks || m.remark || gradeInfo.interpretation}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ============================================================= */}
            {/* 5. OFFICIAL GRADING CONVERSION SCHEME REFERENCE KEY (FOOTER) */}
            {/* ============================================================= */}
            {isStudentLowerPrimary ? (
              /* EXACT PRE-SCHOOL & LOWER PRIMARY GRADING SYSTEM AS REQUESTED FROM IMAGE */
              <div className="border-2 border-slate-400 rounded-2xl p-4 bg-white relative overflow-hidden space-y-3">
                {/* Watermark Crest Background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                  <div className="text-center font-black text-emerald-950">
                    <span className="text-7xl block font-['Outfit']">GRACE WHITE DOVE</span>
                    <span className="text-4xl block">SCHOOL COMPLEX</span>
                    <span className="text-xl block tracking-widest mt-2">GRACE AND GLORY OUR GOAL</span>
                  </div>
                </div>

                <div className="text-center pb-2 border-b border-slate-300">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 font-['Outfit']">
                    GRACE WHITE DOVE SCHOOL COMPLEX
                  </h3>
                  <h4 className="font-black text-xs text-emerald-950 uppercase tracking-wide">
                    GRADING SYSTEM FOR PRE-SCHOOL & LOWER PRIMARY
                  </h4>
                </div>

                <div className="overflow-hidden border border-slate-400 rounded-xl">
                  <table className="w-full text-center text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 font-black uppercase text-[10px] border-b border-slate-400">
                        <th className="py-2 px-3 border-r border-slate-300">MARKS (%)</th>
                        <th className="py-2 px-3 border-r border-slate-300">POSITION</th>
                        <th className="py-2 px-3">INTERPRETATION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300 font-semibold text-slate-800">
                      {LOWER_PRIMARY_GRADING_SCHEME.map((row, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                          <td className="py-1.5 px-3 border-r border-slate-300 font-mono font-bold">{row.scoreRangeLabel}</td>
                          <td className="py-1.5 px-3 border-r border-slate-300 font-black text-emerald-950">{row.position}</td>
                          <td className="py-1.5 px-3 font-bold text-slate-900">{row.interpretation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* JHS CONVERSION REFERENCE */
              <div className="border border-slate-300 rounded-2xl p-4 bg-slate-50/80 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-800" />
                  <span className="font-extrabold text-xs text-emerald-950 uppercase tracking-wider font-['Outfit']">
                    Official JHS Grading Scheme & Conversion Scale Reference
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Examination and continuous assessment raw scores are converted according to the following official scheme:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                  {JHS_GRADING_SCHEME.map((tier, idx) => (
                    <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block font-mono">{tier.scoreRangeLabel}</span>
                        <span className="text-slate-500">{tier.interpretation}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-xs text-emerald-900 block">{tier.grade}</span>
                        <span className="font-mono text-slate-600 font-bold">{tier.gradePoint.toFixed(1)} GP</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[10px] text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <strong className="text-slate-900">Audit:</strong> The grade point is zero.
                  </div>
                  <div>
                    <strong className="text-slate-900">Incomplete (IC):</strong> A student is graded IC when he/she misses one or more components of the assessment.
                  </div>
                </div>
              </div>
            )}

            {/* 6. Qualitative Appraisal, Signatures & Stamp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="border border-slate-300 rounded-2xl p-4 space-y-2 bg-white">
                <span className="font-bold text-emerald-950 block text-xs uppercase tracking-wider">
                  Class Teacher's General Appraisal:
                </span>
                <p className="text-slate-700 italic text-[11px] leading-relaxed">
                  "Demonstrates remarkable intellectual dedication, keen curiosity, and exemplary manners. Participates actively in all academic activities. Keep up the brilliant effort!"
                </p>
                <div className="pt-3 text-[11px] text-slate-500 border-t border-slate-200 flex justify-between items-center">
                  <span>Class Teacher Signature</span>
                  <span className="font-mono text-slate-700">✓ Signed: _________________</span>
                </div>
              </div>

              <div className="border border-slate-300 rounded-2xl p-4 space-y-2 bg-white">
                <span className="font-bold text-emerald-950 block text-xs uppercase tracking-wider">
                  Head of School Official Endorsement:
                </span>
                <p className="text-slate-700 italic text-[11px] leading-relaxed">
                  "Promoted to next grade level with commendation for excellence. Grace White Dove School Complex continues to nurture values-driven academic distinction."
                </p>
                <div className="pt-3 text-[11px] text-slate-500 border-t border-slate-200 flex justify-between items-center">
                  <span>Headmistress: <strong>Diana Adu-Boahen (M.Ed)</strong></span>
                  <span className="font-bold text-amber-900">[OFFICIAL SEAL AFFIXED]</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: EXAM SCHEDULES */}
      {/* ========================================================================= */}
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
                  Max Marks: {sch.maxMarks || 100}
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

      {/* ========================================================================= */}
      {/* TAB 4: OFFICIAL GRADING SCHEMES DEDICATED REFERENCE TAB */}
      {/* ========================================================================= */}
      {activeTab === 'grading-scheme' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Navigation Sub-Tabs */}
          <div className="flex justify-center">
            <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-2">
              <button
                onClick={() => setActiveSchemeTab('lower-primary')}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeSchemeTab === 'lower-primary'
                    ? 'bg-emerald-950 text-amber-300 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pre-School & Lower Primary (Nursery to Basic 3)
              </button>
              <button
                onClick={() => setActiveSchemeTab('jhs-upper')}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeSchemeTab === 'jhs-upper'
                    ? 'bg-emerald-950 text-amber-300 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                JHS & Upper Primary (Basic 4 to JHS 3)
              </button>
            </div>
          </div>

          {activeSchemeTab === 'lower-primary' ? (
            /* PRE-SCHOOL & LOWER PRIMARY FULL REFERENCE (EXACT FROM UPLOADED IMAGE) */
            <div className="bg-white rounded-3xl border-2 border-slate-300 p-8 shadow-sm space-y-6 relative overflow-hidden">
              {/* Decorative Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <div className="text-center font-black text-emerald-950">
                  <span className="text-8xl block font-['Outfit']">GRACE WHITE DOVE</span>
                  <span className="text-5xl block">SCHOOL COMPLEX</span>
                  <span className="text-2xl block tracking-widest mt-3">GRACE AND GLORY OUR GOAL</span>
                </div>
              </div>

              <div className="text-center border-b border-slate-200 pb-5">
                <h2 className="text-xl font-bold text-slate-900 uppercase font-['Outfit'] tracking-wide">
                  GRACE WHITE DOVE SCHOOL COMPLEX
                </h2>
                <h3 className="text-lg font-black text-emerald-950 uppercase tracking-tight mt-1">
                  GRADING SYSTEM FOR PRE-SCHOOL & LOWER PRIMARY
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Applicable to Creche, Nursery 1, Nursery 2, KG 1, KG 2, Primary 1 (Class 1), Primary 2 (Class 2), and Primary 3 (Class 3).
                </p>
              </div>

              <div className="overflow-hidden border border-slate-300 rounded-2xl shadow-xs">
                <table className="w-full text-center text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-900 font-extrabold uppercase text-[11px] border-b border-slate-300">
                    <tr>
                      <th className="py-3.5 px-6 border-r border-slate-200">MARKS (%)</th>
                      <th className="py-3.5 px-6 border-r border-slate-200">POSITION</th>
                      <th className="py-3.5 px-6">INTERPRETATION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
                    {LOWER_PRIMARY_GRADING_SCHEME.map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80 hover:bg-slate-100/60'}>
                        <td className="py-3 px-6 border-r border-slate-200 font-mono font-bold text-slate-900 text-sm">
                          {row.scoreRangeLabel}
                        </td>
                        <td className="py-3 px-6 border-r border-slate-200 font-black text-emerald-950 text-sm">
                          <span className={`inline-block px-3 py-1 rounded-lg border ${row.badgeClass}`}>
                            {row.position}
                          </span>
                        </td>
                        <td className="py-3 px-6 font-bold text-slate-900 text-xs tracking-wide">
                          {row.interpretation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold font-['Outfit']">Pre-School & Lower Primary Assessment Note</h4>
                  <p className="mt-1 text-slate-700 leading-relaxed">
                    Under the Grace White Dove School Complex Pre-School & Lower Primary framework, academic appraisals emphasize continuous mastery, foundational literacy, numeracy proficiency, and creative development rather than letter grades.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* JHS & UPPER PRIMARY REFERENCE */
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-xl font-black text-emerald-950 font-['Outfit']">
                  JHS & Upper Primary Grading & Evaluation Scheme
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Applicable to Primary 4, Primary 5, Primary 6, JHS 1, JHS 2, and JHS 3:
                </p>
              </div>

              <div className="overflow-hidden border border-slate-300 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-emerald-950 text-white font-bold uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Raw Score</th>
                      <th className="py-3 px-4 text-center">Grade</th>
                      <th className="py-3 px-4 text-center">Grade Point</th>
                      <th className="py-3 px-4">Interpretation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {JHS_GRADING_SCHEME.map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{row.scoreRangeLabel}</td>
                        <td className="py-3 px-4 text-center font-black">
                          <span className={`px-2.5 py-1 rounded text-xs border ${row.badgeClass}`}>
                            {row.grade}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-black text-slate-900">
                          {row.gradePoint.toFixed(1)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{row.interpretation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs">
                <h4 className="font-bold text-slate-900 font-['Outfit'] text-sm">Other Grades:</h4>
                <div className="space-y-2 text-slate-700">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="font-bold text-emerald-950 block">Audit</span>
                    <p className="text-slate-600 text-xs">The grade point is zero.</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="font-bold text-emerald-950 block">Incomplete (IC)</span>
                    <p className="text-slate-600 text-xs">
                      A student is graded IC when he/she misses one or more components of the assessment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
