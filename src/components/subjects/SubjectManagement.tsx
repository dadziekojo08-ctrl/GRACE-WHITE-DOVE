import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Subject } from '../../types';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle,
  FileText,
  Clock,
  Layers,
  GraduationCap,
  Sparkles,
  BarChart,
  UserCheck,
  TrendingUp,
  Award
} from 'lucide-react';

export const SubjectManagement: React.FC = () => {
  const { subjects, addSubject, updateSubject, classes } = useSchool();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department: 'Mathematics & Computing',
    classLevel: 'JHS',
    teacher: '',
    periodsPerWeek: 4,
    syllabusProgress: 0,
    currentTopic: '',
    textbook: '',
    totalStudents: 0
  });

  const filteredSubjects = subjects.filter((subj) => {
    const matchesSearch =
      subj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subj.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subj.teacher.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || subj.department.includes(selectedDept);
    return matchesSearch && matchesDept;
  });

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.teacher) return;

    addSubject({
      name: formData.name,
      code: formData.code.toUpperCase(),
      department: formData.department,
      classLevel: formData.classLevel,
      teacher: formData.teacher,
      periodsPerWeek: Number(formData.periodsPerWeek) || 4,
      syllabusProgress: Number(formData.syllabusProgress) || 50,
      currentTopic: formData.currentTopic,
      textbook: formData.textbook,
      totalStudents: Number(formData.totalStudents) || 30
    });

    setFormData({
      name: '',
      code: '',
      department: 'Mathematics & Computing',
      classLevel: 'JHS',
      teacher: '',
      periodsPerWeek: 5,
      syllabusProgress: 60,
      currentTopic: '',
      textbook: '',
      totalStudents: 32
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 p-6 text-white shadow-md border border-emerald-700/60">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-emerald-950 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Curriculum & Syllabus
              </span>
              <span className="text-emerald-300 text-xs font-medium">National Curriculum (NaCCA Standards)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Academic Subjects Directory
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl">
              Track course codes, syllabus milestones, assigned subject teachers, recommended textbooks, and weekly period allocations.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Active Subjects</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-['Outfit']">{subjects.length}</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Core & Elective</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">NaCCA standard compliant</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Avg Syllabus Progress</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-800 font-['Outfit']">
              {Math.round(subjects.reduce((sum, s) => sum + s.syllabusProgress, 0) / (subjects.length || 1))}%
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Term 1 Pace</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">On schedule for mid-terms</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Weekly Teaching Periods</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-['Outfit']">
              {subjects.reduce((sum, s) => sum + s.periodsPerWeek, 0)}
            </span>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">Periods/Wk</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Class timetable slots</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Academic Departments</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-800 font-['Outfit']">4</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Specialized</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Math, Science, Languages, ICT</p>
        </div>
      </div>

      {/* Main Subjects Table & Filters */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subject, code, teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-800 w-64"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Mathematics', 'Science', 'Languages', 'Computing', 'Humanities'].map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDept === dept
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((subj) => (
            <div
              key={subj.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-700/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="bg-emerald-50 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                      {subj.code} • {subj.classLevel}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5 group-hover:text-emerald-900 transition-colors">
                      {subj.name}
                    </h3>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-emerald-800">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="font-semibold text-slate-800">{subj.teacher}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{subj.periodsPerWeek} Periods/week • {subj.department}</span>
                  </div>
                  {subj.currentTopic && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-700">
                      <span className="font-bold text-emerald-900 block">Current Topic:</span>
                      <span className="text-slate-600">{subj.currentTopic}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Syllabus Covered</span>
                    <span className="font-bold text-emerald-900">{subj.syllabusProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-700 h-full rounded-full transition-all"
                      style={{ width: `${subj.syllabusProgress}%` }}
                    />
                  </div>
                </div>
                {subj.textbook && (
                  <p className="text-[10px] text-slate-400 truncate">
                    📖 {subj.textbook}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Subject Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Academic Subject</h3>
            <p className="text-xs text-slate-500 mb-4">Register a new curriculum course</p>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. French Language"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FRN-201"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Class Level</label>
                  <input
                    type="text"
                    placeholder="e.g. JHS 1 - 3"
                    value={formData.classLevel}
                    onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Teacher</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Madame Claire Dupont"
                  value={formData.teacher}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Periods/Week</label>
                  <input
                    type="number"
                    value={formData.periodsPerWeek}
                    onChange={(e) => setFormData({ ...formData, periodsPerWeek: parseInt(e.target.value) || 4 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Syllabus Progress (%)</label>
                  <input
                    type="number"
                    value={formData.syllabusProgress}
                    onChange={(e) => setFormData({ ...formData, syllabusProgress: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Textbook Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Pearson French for Beginners"
                  value={formData.textbook}
                  onChange={(e) => setFormData({ ...formData, textbook: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs cursor-pointer"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
