import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { ClassRoom } from '../../types';
import {
  Layers,
  Users,
  UserCheck,
  Plus,
  Search,
  BookOpen,
  CalendarDays,
  DoorOpen,
  GraduationCap,
  Sparkles,
  CheckCircle,
  Eye,
  Edit,
  Building,
  Trash2,
  Sliders,
  Check,
  X,
  AlertTriangle,
  ArrowRight,
  UserPlus,
  Grid
} from 'lucide-react';

export const ClassManagement: React.FC = () => {
  const {
    classes,
    addClass,
    updateClass,
    deleteClass,
    assignClassTeacher,
    updateClassCapacity,
    students,
    staff,
    setActiveTab,
    academicYear,
    setSelectedTimetableClass
  } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeskCapacityModalOpen, setIsDeskCapacityModalOpen] = useState(false);
  const [isAssignTeacherModalOpen, setIsAssignTeacherModalOpen] = useState(false);
  const [isTeacherMatrixModalOpen, setIsTeacherMatrixModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassRoom | null>(null);
  const [targetClassForTeacher, setTargetClassForTeacher] = useState<ClassRoom | null>(null);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  
  // Inline desk capacity editing
  const [inlineEditingClassId, setInlineEditingClassId] = useState<string | null>(null);
  const [inlineCapacityVal, setInlineCapacityVal] = useState<number>(30);

  // Toast / Feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add Class Form State
  const [formData, setFormData] = useState({
    name: '',
    level: 'Primary',
    section: 'A',
    stream: 'Stream A',
    classTeacher: '',
    capacity: 35,
    roomNumber: 'Block A - Room 101',
    academicYear: academicYear || '2025/2026',
    subjects: ['English Language', 'Mathematics', 'Natural Science', 'Our World Our People']
  });

  // Bulk Desk Capacity State
  const [bulkCapacities, setBulkCapacities] = useState<Record<string, number>>({});
  const [universalCapacity, setUniversalCapacity] = useState<number>(35);

  // Single Teacher Assignment State
  const [selectedTeacherForClass, setSelectedTeacherForClass] = useState<string>('');
  const [customTeacherName, setCustomTeacherName] = useState<string>('');

  // Matrix Teacher Assignment State
  const [matrixAssignments, setMatrixAssignments] = useState<Record<string, string>>({});

  // Filtered teachers from staff registry
  const availableTeachers = staff.filter(
    (s) => s.role === 'Teacher' || s.department.toLowerCase().includes('academic') || s.designation.toLowerCase().includes('teacher')
  );

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cls.classTeacher && cls.classTeacher.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cls.roomNumber && cls.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLevel =
      selectedLevel === 'All' ||
      cls.level.toLowerCase().includes(selectedLevel.toLowerCase()) ||
      (selectedLevel === 'Preschool' && (cls.level.includes('Creche') || cls.level.includes('Nursery') || cls.level.includes('KG'))) ||
      (selectedLevel === 'Primary' && cls.level.includes('Primary')) ||
      (selectedLevel === 'JHS' && cls.level.includes('JHS'));
    return matchesSearch && matchesLevel;
  });

  const totalCapacity = classes.reduce((sum, c) => sum + (Number(c.capacity) || 0), 0);
  const totalEnrolled = students.length;
  const totalTeachersAssigned = classes.filter((c) => c.classTeacher && c.classTeacher.trim() !== '').length;
  const teacherCoverageRate = classes.length > 0 ? Math.round((totalTeachersAssigned / classes.length) * 100) : 0;
  const occupancyPercentage = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

  // Level subject suggestions
  const getDefaultSubjectsForLevel = (level: string) => {
    if (level.includes('Creche') || level.includes('Nursery') || level.includes('Preschool')) {
      return ['Early Numeracy', 'Rhymes & Phonics', 'Creative Play', 'Sensory & Motor Skills'];
    }
    if (level.includes('KG')) {
      return ['Numeracy & Counting', 'Phonics & Reading', 'Our World Our People', 'Creative Arts'];
    }
    if (level.includes('Primary')) {
      return ['English Language', 'Mathematics', 'Natural Science', 'Our World Our People', 'Computing (ICT)', 'Religious & Moral Education', 'Creative Arts', 'Ghanaian Language'];
    }
    if (level.includes('JHS')) {
      return ['English Language', 'Integrated Science', 'Mathematics', 'Social Studies', 'Information & Communication Tech (ICT)', 'Religious & Moral Education', 'French', 'Ghanaian Language & Culture', 'Career Technology', 'Creative Arts & Design'];
    }
    return ['English Language', 'Mathematics', 'Integrated Science', 'Social Studies', 'ICT', 'Religious & Moral Education', 'Creative Arts', 'Ghanaian Language'];
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const teacherToAssign = formData.classTeacher === '__custom__' ? customTeacherName.trim() : formData.classTeacher.trim();

    addClass({
      name: formData.name.trim(),
      level: formData.level,
      section: formData.section,
      stream: formData.stream,
      classTeacher: teacherToAssign,
      capacity: Number(formData.capacity) || 35,
      enrolledCount: 0,
      roomNumber: formData.roomNumber || 'Block A',
      academicYear: formData.academicYear,
      subjects: formData.subjects.length > 0 ? formData.subjects : getDefaultSubjectsForLevel(formData.level)
    });

    showToast(`Successfully created class "${formData.name.trim()}" with ${formData.capacity} desk capacity.`);

    setFormData({
      name: '',
      level: 'Primary',
      section: 'A',
      stream: 'Stream A',
      classTeacher: '',
      capacity: 35,
      roomNumber: 'Block A - Room 101',
      academicYear: academicYear || '2025/2026',
      subjects: ['English Language', 'Mathematics', 'Natural Science', 'Our World Our People']
    });
    setCustomTeacherName('');
    setIsAddModalOpen(false);
  };

  const handleUpdateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    const teacherToAssign = editingClass.classTeacher === '__custom__' ? customTeacherName.trim() : editingClass.classTeacher;

    updateClass(editingClass.id, {
      ...editingClass,
      classTeacher: teacherToAssign,
      capacity: Number(editingClass.capacity) || 30
    });

    showToast(`Updated class details for ${editingClass.name}.`);
    setIsEditModalOpen(false);
    setEditingClass(null);
  };

  const handleDeleteClassConfirm = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action will remove the class record.`)) {
      deleteClass(id);
      showToast(`Class "${name}" has been removed from the system.`);
    }
  };

  // Open Desk Capacity Modal
  const openDeskCapacityModal = () => {
    const caps: Record<string, number> = {};
    classes.forEach((c) => {
      caps[c.id] = c.capacity;
    });
    setBulkCapacities(caps);
    setIsDeskCapacityModalOpen(true);
  };

  // Save All Desk Capacities
  const handleSaveBulkCapacities = () => {
    Object.entries(bulkCapacities).forEach(([classId, cap]) => {
      updateClassCapacity(classId, Number(cap) || 30);
    });
    showToast(`Successfully updated desk capacities across all active classes.`);
    setIsDeskCapacityModalOpen(false);
  };

  // Apply Universal Desk Capacity
  const handleApplyUniversalCapacity = () => {
    const val = Number(universalCapacity) || 35;
    const updated: Record<string, number> = {};
    classes.forEach((c) => {
      updated[c.id] = val;
    });
    setBulkCapacities(updated);
    showToast(`Applied ${val} desks to all ${classes.length} active classes in preview. Click "Save All" to confirm.`);
  };

  // Save Single Inline Capacity
  const handleSaveInlineCapacity = (classId: string) => {
    updateClassCapacity(classId, Number(inlineCapacityVal) || 30);
    setInlineEditingClassId(null);
    showToast(`Desk capacity updated to ${inlineCapacityVal}.`);
  };

  // Open Assign Teacher Modal for a single class
  const openAssignTeacherModal = (cls: ClassRoom) => {
    setTargetClassForTeacher(cls);
    setSelectedTeacherForClass(cls.classTeacher || '');
    setCustomTeacherName('');
    setIsAssignTeacherModalOpen(true);
  };

  // Confirm Single Teacher Assignment
  const handleConfirmTeacherAssignment = () => {
    if (!targetClassForTeacher) return;
    const teacherName = selectedTeacherForClass === '__custom__' ? customTeacherName.trim() : selectedTeacherForClass.trim();
    assignClassTeacher(targetClassForTeacher.id, teacherName);
    showToast(`Assigned ${teacherName || 'None'} as Class Teacher for ${targetClassForTeacher.name}.`);
    setIsAssignTeacherModalOpen(false);
    setTargetClassForTeacher(null);
  };

  // Open Teacher Matrix Modal
  const openTeacherMatrixModal = () => {
    const matrix: Record<string, string> = {};
    classes.forEach((c) => {
      matrix[c.id] = c.classTeacher || '';
    });
    setMatrixAssignments(matrix);
    setIsTeacherMatrixModalOpen(true);
  };

  // Save Teacher Matrix
  const handleSaveTeacherMatrix = () => {
    Object.entries(matrixAssignments).forEach(([classId, teacherName]) => {
      assignClassTeacher(classId, String(teacherName || ''));
    });
    showToast(`Class teacher assignments successfully updated for all classes.`);
    setIsTeacherMatrixModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-emerald-700 flex items-center gap-2 animate-in slide-in-from-top-4">
          <CheckCircle className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 p-6 text-white shadow-md border border-emerald-700/60">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-emerald-950 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Academic Administration
              </span>
              <span className="text-emerald-300 text-xs font-medium">{academicYear} Academic Session</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Class & Desk Capacity Management
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl">
              Configure active classes, adjust total desk capacity & classroom seat allocations, and assign class masters and mistresses.
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={openDeskCapacityModal}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs border border-emerald-600/80 transition-all cursor-pointer"
            >
              <Building className="w-4 h-4 text-amber-300" />
              Adjust Desk Figures
            </button>
            <button
              onClick={openTeacherMatrixModal}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs border border-emerald-600/80 transition-all cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-amber-300" />
              Assign Teachers
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Class
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Classes Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Active Classes</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-['Outfit']">{classes.length}</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Active Arms</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Preschool, Primary & Junior High</p>
        </div>

        {/* Total Desk Capacity Card - Interactive with direct edit action */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Desk Capacity</span>
            <button
              onClick={openDeskCapacityModal}
              title="Click to enter or adjust desk figures"
              className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-400 group-hover:text-emerald-950 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Building className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-['Outfit']">{totalCapacity}</span>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">Total Desks</span>
            </div>
            <button
              onClick={openDeskCapacityModal}
              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
            >
              Edit Figure &rarr;
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {Math.max(0, totalCapacity - totalEnrolled)} vacant desk seats available
          </p>
        </div>

        {/* Total Enrolled Pupils */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Enrolled Pupils</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-800 font-['Outfit']">{totalEnrolled}</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              {occupancyPercentage}% Occupied
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across all active classrooms</p>
        </div>

        {/* Class Masters Assigned */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Teachers Assigned</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-800 font-['Outfit']">{totalTeachersAssigned} / {classes.length}</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{teacherCoverageRate}%</span>
            </div>
            <button
              onClick={openTeacherMatrixModal}
              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
            >
              Assign &rarr;
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {classes.length - totalTeachersAssigned > 0
              ? `${classes.length - totalTeachersAssigned} classes require teacher assignment`
              : 'All classes have assigned class teachers'}
          </p>
        </div>
      </div>

      {/* Filter and Class Grid Section */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search class name, teacher, room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-800 w-64"
              />
            </div>
          </div>

          {/* Level Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Preschool', 'Primary', 'JHS'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedLevel === lvl
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Classes Cards Grid */}
        {filteredClasses.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-800">No Classes Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No active classes match your current search or level filter. Click below to add a new class to the system.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add First Class
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClasses.map((cls) => {
              const classStudents = students.filter(
                (s) =>
                  (s.className && s.className.toLowerCase().includes(cls.name.toLowerCase())) ||
                  (s.classId && s.classId === cls.id)
              );
              const actualCount = classStudents.length || cls.enrolledCount || 0;
              const occupancyPct = cls.capacity > 0 ? Math.round((actualCount / cls.capacity) * 100) : 0;
              const hasTeacher = Boolean(cls.classTeacher && cls.classTeacher.trim() !== '');

              return (
                <div
                  key={cls.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-700/60 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  {/* Top Bar */}
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="bg-emerald-50 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {cls.level} • {cls.stream || `Section ${cls.section || 'A'}`}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-1.5 group-hover:text-emerald-900 transition-colors">
                          {cls.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingClass({ ...cls });
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Class Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClassConfirm(cls.id, cls.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Class"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Class Details & Teacher Assignment */}
                    <div className="mt-4 space-y-2.5 text-xs">
                      {/* Assigned Teacher Row */}
                      <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 min-w-0">
                          <UserCheck className={`w-4 h-4 shrink-0 ${hasTeacher ? 'text-emerald-700' : 'text-amber-500'}`} />
                          <div className="truncate">
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Class Master / Mistress</span>
                            <span className={`font-bold block truncate ${hasTeacher ? 'text-slate-800' : 'text-amber-700 italic'}`}>
                              {hasTeacher ? cls.classTeacher : 'Not Assigned'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => openAssignTeacherModal(cls)}
                          className="px-2 py-1 rounded-lg bg-white hover:bg-emerald-900 hover:text-white border border-slate-200 text-slate-700 font-bold text-[10px] transition-all shrink-0 cursor-pointer shadow-2xs"
                        >
                          {hasTeacher ? 'Change' : 'Assign'}
                        </button>
                      </div>

                      {/* Room Number */}
                      <div className="flex items-center gap-2 text-slate-600 px-1">
                        <DoorOpen className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="text-slate-700 font-medium">{cls.roomNumber || 'Room unassigned'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Desk Capacity & Enrollment Section */}
                  <div className="pt-3 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-600 font-medium">Desk Capacity:</span>
                      </div>

                      {/* Interactive Desk Figure with Inline Edit */}
                      {inlineEditingClassId === cls.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            max="150"
                            value={inlineCapacityVal}
                            onChange={(e) => setInlineCapacityVal(Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-16 px-1.5 py-0.5 text-xs font-bold text-center bg-amber-50 border border-amber-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveInlineCapacity(cls.id)}
                            className="p-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md cursor-pointer"
                            title="Save Desk Figure"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setInlineEditingClassId(null)}
                            className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-md cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 font-mono text-xs">
                            {actualCount} / <span className="text-emerald-950 font-black">{cls.capacity} Desks</span>
                          </span>
                          <button
                            onClick={() => {
                              setInlineEditingClassId(cls.id);
                              setInlineCapacityVal(cls.capacity);
                            }}
                            className="p-0.5 text-slate-400 hover:text-amber-700 rounded transition-colors cursor-pointer"
                            title="Edit desk capacity figure"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          occupancyPct > 95
                            ? 'bg-rose-500'
                            : occupancyPct > 80
                            ? 'bg-amber-500'
                            : 'bg-emerald-700'
                        }`}
                        style={{ width: `${Math.min(occupancyPct, 100)}%` }}
                      />
                    </div>

                    {/* Card Actions */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <button
                        onClick={() => setSelectedClass(cls)}
                        className="py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-emerald-900 hover:text-white text-slate-700 font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                        title="View Class Students Roster"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Roster
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTimetableClass(cls.name);
                          setActiveTab('timetable');
                        }}
                        className="py-1.5 px-2 rounded-xl bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-900 font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                        title={`Administer Timetable for ${cls.name}`}
                      >
                        <CalendarDays className="w-3.5 h-3.5" />
                        Timetable
                      </button>
                      <button
                        onClick={() => openAssignTeacherModal(cls)}
                        className="py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-800 hover:text-white text-emerald-900 font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                        title="Assign Class Teacher"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Teacher
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. MODAL: CREATE NEW CLASS                                               */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add New Class</h3>
                <p className="text-xs text-slate-500">Configure class title, desk capacity, and assign teacher</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Class Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Primary 3 Stream B or JHS 2 Stream A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Grade Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  >
                    <option value="Creche">Creche</option>
                    <option value="Nursery 1">Nursery 1</option>
                    <option value="Nursery 2">Nursery 2</option>
                    <option value="KG 1">KG 1</option>
                    <option value="KG 2">KG 2</option>
                    <option value="Primary 1">Primary 1</option>
                    <option value="Primary 2">Primary 2</option>
                    <option value="Primary 3">Primary 3</option>
                    <option value="Primary 4">Primary 4</option>
                    <option value="Primary 5">Primary 5</option>
                    <option value="Primary 6">Primary 6</option>
                    <option value="JHS 1">JHS 1 (Basic 7)</option>
                    <option value="JHS 2">JHS 2 (Basic 8)</option>
                    <option value="JHS 3">JHS 3 (Basic 9)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stream / Section</label>
                  <input
                    type="text"
                    placeholder="e.g. Stream A"
                    value={formData.stream}
                    onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                </div>
              </div>

              {/* Total Desk Capacity Figure */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Total Desk Capacity</span>
                    <span className="text-[10px] text-amber-700 font-bold">Seats</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      max="150"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room Allocation</label>
                  <input
                    type="text"
                    placeholder="e.g. Block B - Room 104"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                </div>
              </div>

              {/* Assign Class Teacher Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Assign Class Teacher</span>
                  <span className="text-[10px] text-emerald-700 font-bold">Faculty Member</span>
                </label>
                <select
                  value={formData.classTeacher}
                  onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                >
                  <option value="">-- Select Teacher from Staff Registry --</option>
                  {availableTeachers.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.staffCode || t.role} - {t.department})
                    </option>
                  ))}
                  {/* All other staff options */}
                  {staff
                    .filter((s) => !availableTeachers.some((at) => at.id === s.id))
                    .map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.role} - {s.department})
                      </option>
                    ))}
                  <option value="__custom__">+ Enter Custom Teacher Name...</option>
                </select>

                {formData.classTeacher === '__custom__' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter teacher's full name"
                    value={customTeacherName}
                    onChange={(e) => setCustomTeacherName(e.target.value)}
                    className="mt-2 w-full bg-amber-50/50 border border-amber-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-900 hover:bg-emerald-950 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MODAL: EDIT CLASS                                                     */}
      {/* ========================================================================= */}
      {isEditModalOpen && editingClass && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Class: {editingClass.name}</h3>
                <p className="text-xs text-slate-500">Update classroom specifications & desk capacity</p>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingClass(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateClass} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Class Title</label>
                <input
                  type="text"
                  required
                  value={editingClass.name}
                  onChange={(e) => setEditingClass({ ...editingClass, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Level</label>
                  <input
                    type="text"
                    value={editingClass.level}
                    onChange={(e) => setEditingClass({ ...editingClass, level: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stream / Section</label>
                  <input
                    type="text"
                    value={editingClass.stream}
                    onChange={(e) => setEditingClass({ ...editingClass, stream: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Desk Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="150"
                    value={editingClass.capacity}
                    onChange={(e) => setEditingClass({ ...editingClass, capacity: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    value={editingClass.roomNumber}
                    onChange={(e) => setEditingClass({ ...editingClass, roomNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                </div>
              </div>

              {/* Class Teacher */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Class Teacher</label>
                <select
                  value={editingClass.classTeacher}
                  onChange={(e) => setEditingClass({ ...editingClass, classTeacher: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                >
                  <option value="">-- No Class Teacher Assigned --</option>
                  {availableTeachers.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.staffCode || t.role})
                    </option>
                  ))}
                  {staff
                    .filter((s) => !availableTeachers.some((at) => at.id === s.id))
                    .map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.role})
                      </option>
                    ))}
                  <option value="__custom__">+ Custom Name...</option>
                </select>

                {editingClass.classTeacher === '__custom__' && (
                  <input
                    type="text"
                    placeholder="Enter teacher name"
                    value={customTeacherName}
                    onChange={(e) => setCustomTeacherName(e.target.value)}
                    className="mt-2 w-full bg-amber-50/50 border border-amber-300 rounded-xl px-3 py-2 text-xs"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingClass(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-900 hover:bg-emerald-950 text-white shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODAL: TOTAL DESK CAPACITY ALLOCATION & FIGURE MANAGER                */}
      {/* ========================================================================= */}
      {isDeskCapacityModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-emerald-800" />
                  Active Classes Desk Capacity Manager
                </h3>
                <p className="text-xs text-slate-500">
                  Enter desk capacity figures for each active classroom and adjust total school seating threshold
                </p>
              </div>
              <button
                onClick={() => setIsDeskCapacityModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Quick Universal Desk Setter */}
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/60 my-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-950 block">Set Universal Desk Capacity</span>
                <span className="text-[11px] text-emerald-800">Quickly apply standard desk count to all {classes.length} active classes</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="150"
                  value={universalCapacity}
                  onChange={(e) => setUniversalCapacity(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-20 bg-white border border-emerald-300 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-950 text-center"
                />
                <button
                  onClick={handleApplyUniversalCapacity}
                  className="px-3 py-1.5 bg-emerald-900 hover:bg-emerald-950 text-white rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                >
                  Apply to All
                </button>
              </div>
            </div>

            {/* Active Classes Desk Figures Table */}
            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-2">Active Class</th>
                    <th className="pb-2">Room / Block</th>
                    <th className="pb-2">Enrolled</th>
                    <th className="pb-2 text-right">Desk Capacity (Figure)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classes.map((cls) => {
                    const currentVal = bulkCapacities[cls.id] ?? cls.capacity;
                    const enrolled = students.filter((s) => s.className?.toLowerCase().includes(cls.name.toLowerCase()) || s.classId === cls.id).length;

                    return (
                      <tr key={cls.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 font-bold text-slate-800">
                          {cls.name}
                          <span className="text-[10px] text-slate-400 block font-normal">{cls.level}</span>
                        </td>
                        <td className="py-2.5 text-slate-600 font-mono text-[11px]">{cls.roomNumber || '—'}</td>
                        <td className="py-2.5 font-bold text-emerald-800">{enrolled} Pupils</td>
                        <td className="py-2.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setBulkCapacities((prev) => ({
                                  ...prev,
                                  [cls.id]: Math.max(1, (prev[cls.id] ?? cls.capacity) - 5)
                                }));
                              }}
                              className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                            >
                              -5
                            </button>
                            <input
                              type="number"
                              min="1"
                              max="200"
                              value={currentVal}
                              onChange={(e) => {
                                const val = Math.max(0, parseInt(e.target.value) || 0);
                                setBulkCapacities((prev) => ({ ...prev, [cls.id]: val }));
                              }}
                              className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setBulkCapacities((prev) => ({
                                  ...prev,
                                  [cls.id]: (prev[cls.id] ?? cls.capacity) + 5
                                }));
                              }}
                              className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                            >
                              +5
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Calculated Total Live Footer */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs">
                <span className="text-slate-500">Calculated Total Desk Capacity: </span>
                <span className="font-extrabold text-emerald-950 font-mono text-sm">
                  {Object.values(bulkCapacities).reduce((acc: number, curr: number) => acc + (Number(curr) || 0), 0) || totalCapacity} Desks
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDeskCapacityModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBulkCapacities}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-emerald-950 shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Save Desk Capacities
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: ASSIGN TEACHER TO A SINGLE CLASS                               */}
      {/* ========================================================================= */}
      {isAssignTeacherModalOpen && targetClassForTeacher && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-800" />
                  Assign Class Master / Mistress
                </h3>
                <p className="text-xs text-slate-500">Assign a designated teacher for {targetClassForTeacher.name}</p>
              </div>
              <button
                onClick={() => {
                  setIsAssignTeacherModalOpen(false);
                  setTargetClassForTeacher(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 pt-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Class:</span>
                  <span className="font-bold text-slate-900">{targetClassForTeacher.name}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-slate-500">Currently Assigned:</span>
                  <span className="font-bold text-emerald-800">{targetClassForTeacher.classTeacher || 'None (Unassigned)'}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Teacher from Registry</label>
                <select
                  value={selectedTeacherForClass}
                  onChange={(e) => setSelectedTeacherForClass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                >
                  <option value="">-- Select or Remove Teacher --</option>
                  {availableTeachers.map((t) => {
                    const alreadyAssigned = classes.find((c) => c.classTeacher === t.name && c.id !== targetClassForTeacher.id);
                    return (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.staffCode || t.role}) {alreadyAssigned ? `• Assigned to ${alreadyAssigned.name}` : '• Available'}
                      </option>
                    );
                  })}
                  {staff
                    .filter((s) => !availableTeachers.some((at) => at.id === s.id))
                    .map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.role} - {s.department})
                      </option>
                    ))}
                  <option value="__custom__">+ Enter Custom Teacher Name...</option>
                </select>

                {selectedTeacherForClass === '__custom__' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter teacher's full name"
                    value={customTeacherName}
                    onChange={(e) => setCustomTeacherName(e.target.value)}
                    className="mt-2 w-full bg-amber-50/50 border border-amber-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAssignTeacherModalOpen(false);
                    setTargetClassForTeacher(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmTeacherAssignment}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-900 hover:bg-emerald-950 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Confirm Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: TEACHER ASSIGNMENT MATRIX (BULK ASSIGN)                         */}
      {/* ========================================================================= */}
      {isTeacherMatrixModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Grid className="w-5 h-5 text-emerald-800" />
                  Master Teacher Assignment Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Assign or reassign class masters and mistresses to all active classes across the school
                </p>
              </div>
              <button
                onClick={() => setIsTeacherMatrixModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto flex-1 my-4 space-y-2 pr-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-2">Class Name</th>
                    <th className="pb-2">Level & Room</th>
                    <th className="pb-2">Current Teacher</th>
                    <th className="pb-2 text-right">Assign Class Master</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classes.map((cls) => {
                    const currentTeacher = matrixAssignments[cls.id] ?? cls.classTeacher ?? '';

                    return (
                      <tr key={cls.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 font-bold text-slate-800">{cls.name}</td>
                        <td className="py-2.5 text-slate-500 text-[11px]">{cls.level} • {cls.roomNumber || 'Block A'}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${currentTeacher ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                            {currentTeacher || 'Unassigned'}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <select
                            value={currentTeacher}
                            onChange={(e) => {
                              const val = e.target.value;
                              setMatrixAssignments((prev) => ({ ...prev, [cls.id]: val }));
                            }}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-800 font-medium"
                          >
                            <option value="">-- None (Unassigned) --</option>
                            {availableTeachers.map((t) => (
                              <option key={t.id} value={t.name}>
                                {t.name} ({t.staffCode || t.role})
                              </option>
                            ))}
                            {staff
                              .filter((s) => !availableTeachers.some((at) => at.id === s.id))
                              .map((s) => (
                                <option key={s.id} value={s.name}>
                                  {s.name} ({s.role})
                                </option>
                              ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsTeacherMatrixModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTeacherMatrix}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-900 hover:bg-emerald-950 text-white shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Save All Assignments
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: VIEW CLASS ROSTER                                               */}
      {/* ========================================================================= */}
      {selectedClass && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedClass.name} • Class Roster</h3>
                <p className="text-xs text-slate-500">
                  Class Teacher: <span className="font-bold text-emerald-800">{selectedClass.classTeacher || 'Unassigned'}</span> • Room: {selectedClass.roomNumber || 'Block A'} • Desk Capacity: <span className="font-bold font-mono">{selectedClass.capacity}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedClass(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto flex-1 py-4 space-y-2">
              {students.filter(
                (s) =>
                  (s.className && s.className.toLowerCase().includes(selectedClass.name.toLowerCase())) ||
                  (s.classId && s.classId === selectedClass.id)
              ).length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <Users className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-400 italic">No pupils currently enrolled in {selectedClass.name}.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {students
                    .filter(
                      (s) =>
                        (s.className && s.className.toLowerCase().includes(selectedClass.name.toLowerCase())) ||
                        (s.classId && s.classId === selectedClass.id)
                    )
                    .map((std) => (
                      <div key={std.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                        <img
                          src={std.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(std.firstName)}`}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover bg-slate-200"
                        />
                        <div className="text-xs truncate">
                          <span className="font-bold text-slate-900 block truncate">{std.firstName} {std.lastName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Roll #{std.rollNo || '1'} • {std.admissionNo}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedTimetableClass(selectedClass.name);
                  setSelectedClass(null);
                  setActiveTab('timetable');
                }}
                className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <CalendarDays className="w-3.5 h-3.5 text-amber-700" />
                Administer {selectedClass.name} Timetable
              </button>
              <button
                onClick={() => setSelectedClass(null)}
                className="px-4 py-2 bg-emerald-900 text-white rounded-xl text-xs font-bold hover:bg-emerald-950 cursor-pointer"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
