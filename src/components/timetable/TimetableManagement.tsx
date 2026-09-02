import React, { useState, useMemo, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { TimetableEntry, ClassRoom } from '../../types';
import {
  parseTimeSlot,
  formatTimeSlot,
  calculateDurationMinutes,
  addMinutesToTime,
  sortTimeSlotsChronologically,
  STANDARD_TIME_SLOTS,
  STANDARD_PERIOD_PRESETS,
  POPULAR_GHANA_SUBJECTS,
  getSubjectBadgeColor
} from '../../utils/timetableUtils';
import {
  CalendarDays,
  Clock,
  Plus,
  Trash2,
  Printer,
  MapPin,
  User,
  BookOpen,
  Sparkles,
  Copy,
  AlertTriangle,
  CheckCircle,
  X,
  Edit2,
  Layers,
  ChevronRight,
  School,
  Building,
  RotateCcw,
  Users,
  Check,
  Calendar,
  Sliders,
  Filter,
  ArrowRight
} from 'lucide-react';

interface TimetableManagementProps {
  isTeacherPortalView?: boolean;
  preselectedClass?: string;
}

export const TimetableManagement: React.FC<TimetableManagementProps> = ({
  isTeacherPortalView = false,
  preselectedClass
}) => {
  const {
    timetable,
    addTimetableEntry,
    updateTimetableEntry,
    deleteTimetableEntry,
    clearClassTimetable,
    copyClassTimetable,
    setFullClassTimetable,
    classes,
    subjects: registeredSubjects,
    staff,
    selectedTimetableClass,
    setSelectedTimetableClass,
    academicYear,
    currentUser,
    activeRole
  } = useSchool();

  const isTeacherRole = activeRole === 'Teacher' || currentUser?.role === 'Teacher' || isTeacherPortalView;
  const teacherName = currentUser?.name || '';
  const teacherAssignedClass = currentUser?.assignedClass || classes.find((c) => c.classTeacher?.toLowerCase() === teacherName.toLowerCase())?.name;

  // Active selected class name - if teacher role and not set, default to teacher's class
  const currentClassName =
    preselectedClass ||
    selectedTimetableClass ||
    (isTeacherRole && teacherAssignedClass ? teacherAssignedClass : (classes.length > 0 ? classes[0].name : 'Creche'));

  // Ensure selectedTimetableClass is in sync with teacher's assigned class on initial mount if teacher
  useEffect(() => {
    if (isTeacherRole && teacherAssignedClass && !selectedTimetableClass) {
      setSelectedTimetableClass(teacherAssignedClass);
    }
  }, [isTeacherRole, teacherAssignedClass, selectedTimetableClass, setSelectedTimetableClass]);

  const currentClassObj = classes.find((c) => c.name === currentClassName) || classes[0];

  // View modes & filters
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>('weekly');
  const [activeDayTab, setActiveDayTab] = useState<TimetableEntry['day']>('Monday');
  const [filterMyLessonsOnly, setFilterMyLessonsOnly] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [sourceClassToCopy, setSourceClassToCopy] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form State for Slot Add / Edit with granular Lesson Start Time & End Time
  const [form, setForm] = useState({
    day: 'Monday' as TimetableEntry['day'],
    startTime: '08:00',
    endTime: '08:50',
    subject: 'Mathematics',
    teacherName: isTeacherRole && teacherName ? teacherName : '',
    room: ''
  });

  const days: TimetableEntry['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Base Ghana GES time slots
  const baseTimeSlots = STANDARD_TIME_SLOTS;

  // Filter timetable for currently selected class
  const rawClassTimetable = timetable.filter((t) => t.className === currentClassName);

  // Apply "My Lessons Only" filter if toggled
  const classTimetable = useMemo(() => {
    if (!filterMyLessonsOnly || !teacherName) return rawClassTimetable;
    const lower = teacherName.toLowerCase();
    return rawClassTimetable.filter((t) => (t.teacherName || '').toLowerCase().includes(lower));
  }, [rawClassTimetable, filterMyLessonsOnly, teacherName]);

  // Chronologically sorted dynamic time slots for this class
  const computedTimeSlots = useMemo(() => {
    const slots = new Set<string>();
    baseTimeSlots.forEach((s) => slots.add(s));
    rawClassTimetable.forEach((t) => {
      if (t.timeSlot) slots.add(t.timeSlot);
    });
    return sortTimeSlotsChronologically(Array.from(slots));
  }, [baseTimeSlots, rawClassTimetable]);

  // Available subjects for easy chip selection
  const classSubjects = currentClassObj?.subjects || [];
  const schoolCatalogSubjects = (registeredSubjects || []).map((s) => s.name);
  const allAvailableSubjects = useMemo(() => {
    const combined = Array.from(new Set([...classSubjects, ...schoolCatalogSubjects, ...POPULAR_GHANA_SUBJECTS]));
    return combined;
  }, [classSubjects, schoolCatalogSubjects]);

  // Group classes by school section
  const preschoolClasses = classes.filter((c) =>
    c.level?.toLowerCase().includes('creche') ||
    c.level?.toLowerCase().includes('nursery') ||
    c.level?.toLowerCase().includes('kg') ||
    c.level?.toLowerCase().includes('kindergarten')
  );

  const primaryClasses = classes.filter((c) =>
    c.level?.toLowerCase().includes('primary')
  );

  const jhsClasses = classes.filter((c) =>
    c.level?.toLowerCase().includes('jhs') ||
    c.name?.toLowerCase().includes('jhs')
  );

  // Detect Teacher Scheduling Conflicts across the whole school
  const conflicts = classTimetable.filter((entry) => {
    if (!entry.teacherName || entry.teacherName === 'Unassigned') return false;
    const duplicate = timetable.find(
      (other) =>
        other.id !== entry.id &&
        other.teacherName.trim().toLowerCase() === entry.teacherName.trim().toLowerCase() &&
        other.day === entry.day &&
        other.timeSlot === entry.timeSlot
    );
    return !!duplicate;
  });

  // Calculate duration of current form
  const formDurationMinutes = useMemo(() => {
    return calculateDurationMinutes(form.startTime, form.endTime);
  }, [form.startTime, form.endTime]);

  // Duration quick setter
  const handleSetDuration = (durationMin: number) => {
    const newEnd = addMinutesToTime(form.startTime || '08:00', durationMin);
    setForm((prev) => ({ ...prev, endTime: newEnd }));
  };

  // Preset quick setter
  const handleApplyPreset = (preset: typeof STANDARD_PERIOD_PRESETS[0]) => {
    setForm((prev) => ({
      ...prev,
      startTime: preset.startTime,
      endTime: preset.endTime
    }));
  };

  // Open modal with prefilled day & timeSlot
  const handleOpenAddForSlot = (day: TimetableEntry['day'], slotString?: string) => {
    const parsed = slotString ? parseTimeSlot(slotString) : { startTime: '08:00', endTime: '08:50', durationMinutes: 50 };
    const defaultSubject = classSubjects.length > 0 ? classSubjects[0] : 'Mathematics';
    const defaultTeacher = isTeacherRole && teacherName ? teacherName : (currentClassObj?.classTeacher || (staff[0] ? staff[0].name : 'Class Teacher'));
    const defaultRoom = currentClassObj?.roomNumber || 'Room 101';

    setForm({
      day,
      startTime: parsed.startTime,
      endTime: parsed.endTime,
      subject: defaultSubject,
      teacherName: defaultTeacher,
      room: defaultRoom
    });
    setIsAddModalOpen(true);
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanStartTime = form.startTime || '08:00';
    const cleanEndTime = form.endTime || addMinutesToTime(cleanStartTime, 50);
    const timeSlot = formatTimeSlot(cleanStartTime, cleanEndTime);

    addTimetableEntry({
      className: currentClassName,
      day: form.day,
      timeSlot,
      subject: form.subject.trim() || 'General Studies',
      teacherName: form.teacherName.trim() || (isTeacherRole && teacherName ? teacherName : 'Class Teacher'),
      room: form.room.trim() || currentClassObj?.roomNumber || 'Classroom'
    });
    setIsAddModalOpen(false);
    showToast(`Added lesson: ${form.subject} on ${form.day} (${timeSlot}) for ${currentClassName}`);
  };

  const handleOpenEdit = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    const parsed = parseTimeSlot(entry.timeSlot);
    setForm({
      day: entry.day,
      startTime: parsed.startTime,
      endTime: parsed.endTime,
      subject: entry.subject,
      teacherName: entry.teacherName || (isTeacherRole && teacherName ? teacherName : 'Class Teacher'),
      room: entry.room || currentClassObj?.roomNumber || 'Classroom'
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    const cleanStartTime = form.startTime || '08:00';
    const cleanEndTime = form.endTime || addMinutesToTime(cleanStartTime, 50);
    const timeSlot = formatTimeSlot(cleanStartTime, cleanEndTime);

    updateTimetableEntry(editingEntry.id, {
      day: form.day,
      timeSlot,
      subject: form.subject.trim() || 'General Studies',
      teacherName: form.teacherName.trim() || (isTeacherRole && teacherName ? teacherName : 'Class Teacher'),
      room: form.room.trim() || currentClassObj?.roomNumber || 'Classroom'
    });
    setIsEditModalOpen(false);
    setEditingEntry(null);
    showToast(`Updated lesson: ${form.subject} on ${form.day} (${timeSlot})`);
  };

  // Auto-generate template based on level (Ghana GES curriculum)
  const handleApplyTemplate = () => {
    const levelLower = currentClassObj?.level?.toLowerCase() || '';
    const nameLower = currentClassName.toLowerCase();
    const classTeacher = (isTeacherRole && teacherName) || currentClassObj?.classTeacher || 'Class Teacher';
    const room = currentClassObj?.roomNumber || 'Classroom';

    let scheduleTemplate: Omit<TimetableEntry, 'id'>[] = [];
    const teachingBaseSlots = baseTimeSlots.filter(
      (slot) => !slot.includes('10:30 - 11:00') && !slot.includes('12:40 - 13:30')
    );

    if (levelLower.includes('creche') || nameLower.includes('creche')) {
      const crecheSubjects = [
        ['Circle Time & Rhymes', 'Sensory Play', 'Early Phonics', 'Creative Drawing', 'Outdoor Play'],
        ['Story & Language', 'Motor Skills', 'Rhymes & Music', 'Play Dough & Art', 'Nap & Free Play'],
        ['Counting & Shapes', 'Sensory Exploration', 'Phonics Songs', 'Water Play', 'Picture Books'],
        ['Early Phonics', 'Creative Movements', 'Rhymes & Poems', 'Block Building', 'Outdoor Play'],
        ['Show & Tell', 'Sensory Activities', 'Rhymes & Singing', 'Free Play & Games', 'Storytime']
      ];

      days.forEach((day, dIdx) => {
        teachingBaseSlots.slice(0, 5).forEach((slot, sIdx) => {
          scheduleTemplate.push({
            className: currentClassName,
            day,
            timeSlot: slot,
            subject: crecheSubjects[dIdx][sIdx] || 'Sensory & Motor Play',
            teacherName: classTeacher,
            room
          });
        });
      });
    } else if (levelLower.includes('nursery') || levelLower.includes('kg') || nameLower.includes('kg') || nameLower.includes('nursery')) {
      const kgSubjects = [
        ['Phonics & Sounds', 'Numeracy & Counting', 'Our World Our People', 'Rhymes & Poetry', 'Creative Arts', 'Indoor Games', 'Storytelling'],
        ['Writing Readiness', 'Number Work', 'Phonics & Reading', 'Science Discovery', 'Music & Movement', 'Coloring & Art', 'Free Play'],
        ['Phonics & Sounds', 'Numeracy Activities', 'Our World Our People', 'Physical Development', 'Rhymes & Singing', 'Sensory Math', 'Story Time'],
        ['Letter Formation', 'Counting & Matching', 'Phonics & Reading', 'Creative Crafts', 'Our World Our People', 'Indoor Activities', 'Reading Corner'],
        ['Phonics Review', 'Fun Mathematics', 'Science & Nature', 'Cultural Rhymes', 'Creative Drama', 'Outdoor Sports', 'Closing Circle']
      ];

      days.forEach((day, dIdx) => {
        teachingBaseSlots.slice(0, 7).forEach((slot, sIdx) => {
          scheduleTemplate.push({
            className: currentClassName,
            day,
            timeSlot: slot,
            subject: kgSubjects[dIdx][sIdx] || 'Our World Our People',
            teacherName: classTeacher,
            room
          });
        });
      });
    } else if (levelLower.includes('jhs') || nameLower.includes('jhs')) {
      const jhsWeeklyPlan = [
        ['Mathematics', 'English Language', 'Integrated Science', 'Social Studies', 'ICT (Computing)', 'Career Technology', 'French'],
        ['Integrated Science', 'Mathematics', 'English Language', 'RME', 'Creative Arts & Design', 'Ghanaian Language', 'Social Studies'],
        ['English Language', 'Social Studies', 'Mathematics', 'Integrated Science', 'Career Technology', 'ICT (Computing)', 'Physical Education'],
        ['Mathematics', 'Integrated Science', 'English Language', 'French', 'Social Studies', 'RME', 'Creative Arts & Design'],
        ['English Language', 'Mathematics', 'Integrated Science', 'ICT Lab Practical', 'Ghanaian Language', 'Social Studies', 'Clubs & Societies']
      ];

      days.forEach((day, dIdx) => {
        teachingBaseSlots.slice(0, 7).forEach((slot, sIdx) => {
          scheduleTemplate.push({
            className: currentClassName,
            day,
            timeSlot: slot,
            subject: jhsWeeklyPlan[dIdx][sIdx] || 'English Language',
            teacherName: classTeacher,
            room: jhsWeeklyPlan[dIdx][sIdx]?.includes('ICT') ? 'ICT Lab' : room
          });
        });
      });
    } else {
      const primaryWeeklyPlan = [
        ['Mathematics', 'English Language', 'Natural Science', 'Our World Our People', 'Computing (ICT)', 'RME', 'Creative Arts'],
        ['English Language', 'Mathematics', 'Natural Science', 'Ghanaian Language', 'Our World Our People', 'History of Ghana', 'Physical Education'],
        ['Mathematics', 'English Language', 'Computing (ICT)', 'Natural Science', 'Creative Arts', 'Our World Our People', 'Library & Reading'],
        ['English Language', 'Mathematics', 'Natural Science', 'RME', 'Ghanaian Language', 'Our World Our People', 'French / Phonics'],
        ['Mathematics', 'English Language', 'Natural Science', 'Computing (ICT)', 'Creative Arts & Crafts', 'Our World Our People', 'Clubs & Worship']
      ];

      days.forEach((day, dIdx) => {
        teachingBaseSlots.slice(0, 7).forEach((slot, sIdx) => {
          scheduleTemplate.push({
            className: currentClassName,
            day,
            timeSlot: slot,
            subject: primaryWeeklyPlan[dIdx][sIdx] || 'Mathematics',
            teacherName: classTeacher,
            room: primaryWeeklyPlan[dIdx][sIdx]?.includes('Computing') ? 'Computer Lab' : room
          });
        });
      });
    }

    setFullClassTimetable(currentClassName, scheduleTemplate);
    setIsTemplateModalOpen(false);
    showToast(`Generated curriculum schedule for ${currentClassName} (${scheduleTemplate.length} periods)`);
  };

  // Handle Copying from another class
  const handleCopySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceClassToCopy || sourceClassToCopy === currentClassName) return;

    copyClassTimetable(sourceClassToCopy, currentClassName);
    setIsCopyModalOpen(false);
    showToast(`Copied timetable from ${sourceClassToCopy} to ${currentClassName}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Teacher Workspace Banner if Teacher Mode */}
      {isTeacherRole && (
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-5 rounded-2xl shadow-sm border border-emerald-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black text-lg shadow-sm shrink-0">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black font-['Outfit']">
                  Teacher Timetable & Lesson Scheduler
                </h2>
                <span className="bg-amber-400 text-emerald-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Self-Service Mode
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-1">
                Welcome, <strong>{teacherName || 'Teacher'}</strong>! You can customize lesson start and end times, change lessons, and enter subjects directly for your classroom.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {teacherAssignedClass && (
              <button
                onClick={() => setSelectedTimetableClass(teacherAssignedClass)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentClassName === teacherAssignedClass
                    ? 'bg-amber-400 text-emerald-950 shadow-xs'
                    : 'bg-emerald-800/80 hover:bg-emerald-700 text-white border border-emerald-600'
                }`}
              >
                <School className="w-3.5 h-3.5" />
                My Class: {teacherAssignedClass}
              </button>
            )}
            <button
              onClick={() => handleOpenAddForSlot('Monday', '08:00 - 08:50')}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              Add New Lesson
            </button>
          </div>
        </div>
      )}

      {/* Main Timetable Controls Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                Class Timetable Schedule
                <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {currentClassName}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Set lesson start times, adjust period durations, change lessons, and enter subjects.
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* My Lessons Filter Toggle */}
          {teacherName && (
            <button
              onClick={() => setFilterMyLessonsOnly(!filterMyLessonsOnly)}
              className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all ${
                filterMyLessonsOnly
                  ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
              title="Show only periods taught by me"
            >
              <Filter className="w-3.5 h-3.5" />
              {filterMyLessonsOnly ? 'Showing My Lessons' : 'Filter My Lessons'}
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Print printable timetable"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            Print Timetable
          </button>

          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Auto-fill schedule according to level curriculum"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Auto-Schedule
          </button>

          <button
            onClick={() => setIsCopyModalOpen(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Copy timetable from another class stream"
          >
            <Copy className="w-3.5 h-3.5 text-slate-600" />
            Copy from Class
          </button>

          <button
            onClick={() => handleOpenAddForSlot('Monday', '08:00 - 08:50')}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            Add Lesson Slot
          </button>
        </div>
      </div>

      {/* Class Switcher & View Mode Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <School className="w-4 h-4 text-emerald-800" />
            <label htmlFor="class-select-dropdown" className="font-bold text-slate-800 text-xs">
              Active Classroom:
            </label>
            <select
              id="class-select-dropdown"
              value={currentClassName}
              onChange={(e) => setSelectedTimetableClass(e.target.value)}
              className="bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-1.5 font-bold text-emerald-950 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
            >
              {preschoolClasses.length > 0 && (
                <optgroup label="Early Childhood (Creche, Nursery, KG)">
                  {preschoolClasses.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} {teacherAssignedClass === c.name ? '★ (My Class)' : ''}
                    </option>
                  ))}
                </optgroup>
              )}

              {primaryClasses.length > 0 && (
                <optgroup label="Primary Department (Class 1 to 6)">
                  {primaryClasses.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} {teacherAssignedClass === c.name ? '★ (My Class)' : ''}
                    </option>
                  ))}
                </optgroup>
              )}

              {jhsClasses.length > 0 && (
                <optgroup label="Junior High School (JHS 1 to 3)">
                  {jhsClasses.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} {teacherAssignedClass === c.name ? '★ (My Class)' : ''}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* View Mode Toggle: Weekly Master vs Daily Tabs */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('weekly')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'weekly' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                5-Day Grid
              </button>
              <button
                onClick={() => setViewMode('daily')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'daily' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Day-by-Day
              </button>
            </div>
          </div>
        </div>

        {/* Quick Summary Pill Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-emerald-700 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Lessons</span>
              <span className="font-bold text-slate-800">{classTimetable.length} Periods Scheduled</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <User className="w-4 h-4 text-emerald-700 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Class Master</span>
              <span className="font-bold text-slate-800 truncate block">
                {currentClassObj?.classTeacher || 'Unassigned'}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Default Room</span>
              <span className="font-bold text-slate-800 truncate block">
                {currentClassObj?.roomNumber || 'Room 101'}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Timetable State</span>
              <span className="font-bold text-emerald-800 truncate block">
                {classTimetable.length > 0 ? 'Active & Editable' : 'Empty Schedule'}
              </span>
            </div>
            {classTimetable.length > 0 && (
              <button
                onClick={() => setIsClearConfirmOpen(true)}
                className="text-[10px] text-rose-700 hover:text-rose-900 font-bold underline cursor-pointer"
                title="Clear all timetable slots for this class"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Teacher Conflict Alert */}
      {conflicts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-amber-900">Teacher Schedule Collision Detected</h4>
            <p className="text-amber-800 mt-0.5">
              Some teachers in {currentClassName} are scheduled in other classes simultaneously:
            </p>
            <ul className="mt-1.5 list-disc list-inside text-amber-900 font-medium space-y-0.5">
              {conflicts.map((c) => (
                <li key={c.id}>
                  <span className="font-bold">{c.teacherName}</span> is double-booked on <span className="font-bold">{c.day}</span> ({c.timeSlot})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Daily View Day Selector Tabs */}
      {viewMode === 'daily' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {days.map((d) => {
            const daySlotCount = classTimetable.filter((t) => t.day === d).length;
            const isSelected = activeDayTab === d;
            return (
              <button
                key={d}
                onClick={() => setActiveDayTab(d)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{d}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-emerald-800 text-amber-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {daySlotCount}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Timetable Interactive Grid (Weekly Master) */}
      {viewMode === 'weekly' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[760px]">
              <thead>
                <tr className="bg-emerald-900 text-white uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-3.5 px-4 w-40 border-r border-emerald-800">Time & Duration</th>
                  {days.map((d) => (
                    <th key={d} className="py-3.5 px-4 border-r border-emerald-800 last:border-0 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span>{d}</span>
                        <span className="text-[9px] bg-emerald-800/80 px-1.5 py-0.2 rounded text-emerald-200 font-mono">
                          {classTimetable.filter((t) => t.day === d).length}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {computedTimeSlots.map((slot) => {
                  const isBreak = slot.includes('10:30 - 11:00');
                  const isLunch = slot.includes('12:40 - 13:30');
                  const parsed = parseTimeSlot(slot);

                  if (isBreak || isLunch) {
                    return (
                      <tr key={slot} className="bg-amber-50/80 text-amber-950 font-bold border-y border-amber-200">
                        <td className="py-2.5 px-4 font-mono text-[11px] border-r border-amber-200 text-amber-900 bg-amber-100/50">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            <span>{slot}</span>
                          </div>
                          <span className="text-[9px] text-amber-700 font-normal block mt-0.5">
                            {parsed.durationMinutes} mins
                          </span>
                        </td>
                        <td colSpan={5} className="py-2.5 px-4 text-center tracking-wider uppercase text-[11px]">
                          {isBreak ? '☕ Morning Snack & Health Break (30 Mins)' : '🥗 Lunch & Midday Rest Break (50 Mins)'}
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={slot} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200 align-top">
                        <div className="flex items-center gap-1 text-slate-900">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{slot}</span>
                        </div>
                        <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 inline-block mt-1">
                          {parsed.durationMinutes} mins
                        </span>
                      </td>

                      {days.map((day) => {
                        const entry = classTimetable.find((t) => t.day === day && t.timeSlot === slot);

                        return (
                          <td key={day} className="py-2 px-2.5 border-r border-slate-200 last:border-0 align-top min-w-[130px]">
                            {entry ? (
                              <div
                                onClick={() => handleOpenEdit(entry)}
                                className={`p-2.5 rounded-xl border relative group transition-all hover:shadow-md cursor-pointer ${getSubjectBadgeColor(
                                  entry.subject
                                )}`}
                                title="Click to edit lesson, change time or subject"
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <span className="font-bold block text-xs leading-tight line-clamp-2">
                                    {entry.subject}
                                  </span>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEdit(entry);
                                      }}
                                      className="p-1 text-slate-600 hover:text-emerald-900 hover:bg-white rounded cursor-pointer"
                                      title="Edit lesson & change subject / time"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteTimetableEntry(entry.id);
                                        showToast(`Deleted ${entry.subject} on ${entry.day}`);
                                      }}
                                      className="p-1 text-rose-600 hover:text-rose-900 hover:bg-white rounded cursor-pointer"
                                      title="Remove lesson slot"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                <span className="text-[11px] text-slate-600 block mt-1 truncate">
                                  {entry.teacherName || 'Class Teacher'}
                                </span>

                                <div className="flex items-center justify-between gap-1 mt-1.5 pt-1 border-t border-black/5">
                                  <span className="text-[10px] font-mono text-slate-500 bg-white/80 px-1.5 py-0.2 rounded border border-black/5">
                                    {entry.room || currentClassObj?.roomNumber || 'Room'}
                                  </span>
                                  <span className="text-[9px] text-slate-400 group-hover:text-emerald-800 font-semibold transition-colors">
                                    Edit ✎
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleOpenAddForSlot(day, slot)}
                                className="w-full h-16 border border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-emerald-800 transition-all text-[11px] font-medium group cursor-pointer"
                                title={`Add ${day} lesson at ${slot}`}
                              >
                                <Plus className="w-4 h-4 text-slate-300 group-hover:text-emerald-700 transition-colors" />
                                <span className="text-[10px] text-slate-400 group-hover:text-emerald-700">Add Lesson</span>
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Daily View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">{activeDayTab} Timetable Schedule</h3>
              <p className="text-xs text-slate-500">
                Periods sequence for {currentClassName} on {activeDayTab}
              </p>
            </div>
            <button
              onClick={() => handleOpenAddForSlot(activeDayTab, '08:00 - 08:50')}
              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              Add {activeDayTab} Lesson
            </button>
          </div>

          <div className="space-y-2.5">
            {computedTimeSlots.map((slot) => {
              const isBreak = slot.includes('10:30 - 11:00');
              const isLunch = slot.includes('12:40 - 13:30');
              const parsed = parseTimeSlot(slot);

              if (isBreak || isLunch) {
                return (
                  <div
                    key={slot}
                    className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs text-amber-950 font-bold"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-amber-800">{slot}</span>
                      <span className="text-[10px] bg-amber-200/60 text-amber-900 px-1.5 py-0.5 rounded font-normal">
                        {parsed.durationMinutes}m
                      </span>
                    </div>
                    <span>{isBreak ? '☕ Morning Snack & Recess Break' : '🥗 Midday Lunch Break & Rest'}</span>
                    <span className="text-[10px] uppercase tracking-wider text-amber-700">All Pupils</span>
                  </div>
                );
              }

              const entry = classTimetable.find((t) => t.day === activeDayTab && t.timeSlot === slot);

              return (
                <div
                  key={slot}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    entry ? 'bg-slate-50 border-slate-200 hover:border-emerald-300' : 'border-dashed border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-32 font-mono text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-center shrink-0">
                      <div>{slot}</div>
                      <div className="text-[10px] text-emerald-800 font-semibold">{parsed.durationMinutes} mins</div>
                    </div>

                    {entry ? (
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{entry.subject}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 rounded-full">
                            {entry.room || 'Room'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          Teacher: <strong className="text-slate-700">{entry.teacherName}</strong>
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No subject scheduled for this period</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {entry ? (
                      <>
                        <button
                          onClick={() => handleOpenEdit(entry)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3 text-slate-500" />
                          Change Lesson
                        </button>
                        <button
                          onClick={() => {
                            deleteTimetableEntry(entry.id);
                            showToast(`Removed ${entry.subject} slot`);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleOpenAddForSlot(activeDayTab, slot)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        Add Lesson
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD LESSON SLOT (START TIME, END TIME, DURATION & SUBJECTS)       */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-base font-['Outfit'] flex items-center gap-2">
                  <Plus className="w-4 h-4 text-amber-300" />
                  Add Lesson to Timetable
                </h3>
                <p className="text-xs text-emerald-200">
                  Class: <strong>{currentClassName}</strong>
                  {isTeacherRole && teacherName ? ` • Teacher: ${teacherName}` : ''}
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-emerald-200 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEntry} className="p-6 space-y-4 text-xs overflow-y-auto">
              {/* Day of Week */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Day of Week</label>
                <div className="grid grid-cols-5 gap-1">
                  {days.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setForm({ ...form, day: d })}
                      className={`py-2 text-center rounded-xl font-bold transition-all text-xs cursor-pointer ${
                        form.day === d
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {d.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lesson Timing: Start Time & End Time */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-700" />
                    Lesson Timing (Start & End Time)
                  </span>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Duration: {formDurationMinutes} mins
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 text-[11px] mb-1">Time to Start Lesson</label>
                    <input
                      type="time"
                      required
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 bg-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 text-[11px] mb-1">Time to End Lesson</label>
                    <input
                      type="time"
                      required
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 bg-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>
                </div>

                {/* Quick Duration Setters */}
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block mb-1">Quick Duration Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[30, 40, 45, 50, 60, 90].map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => handleSetDuration(dur)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          formDurationMinutes === dur
                            ? 'bg-emerald-800 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900'
                        }`}
                      >
                        +{dur} mins {dur === 90 ? '(Double)' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Standard Period Presets Dropdown */}
                <div className="pt-1">
                  <label className="block text-[10px] text-slate-500 font-semibold mb-1">Or choose Standard Ghana School Period:</label>
                  <select
                    onChange={(e) => {
                      const found = STANDARD_PERIOD_PRESETS.find((p) => p.label === e.target.value);
                      if (found) handleApplyPreset(found);
                    }}
                    defaultValue=""
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800 font-medium"
                  >
                    <option value="" disabled>-- Select standard period preset --</option>
                    {STANDARD_PERIOD_PRESETS.map((p) => (
                      <option key={p.label} value={p.label}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject Input & Quick Suggestions */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Subject Name
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 font-bold text-sm"
                    placeholder="e.g. Mathematics, Integrated Science, Computing"
                  />

                  {/* Quick Subject Chips */}
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                      Quick select subject:
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
                      {allAvailableSubjects.map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => setForm({ ...form, subject: sub })}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                            form.subject.toLowerCase() === sub.toLowerCase()
                              ? 'bg-emerald-800 text-white font-bold'
                              : 'bg-white text-slate-700 hover:bg-emerald-100 hover:text-emerald-950 border border-slate-200'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Teacher and Room Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teacher</label>
                  <input
                    type="text"
                    value={form.teacherName}
                    onChange={(e) => setForm({ ...form, teacherName: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 font-medium"
                    placeholder="e.g. Teacher Name"
                  />
                  {staff.length > 0 && (
                    <div className="mt-1">
                      <select
                        onChange={(e) => {
                          if (e.target.value) setForm({ ...form, teacherName: e.target.value });
                        }}
                        defaultValue=""
                        className="w-full text-[10px] border border-slate-200 rounded-lg p-1 bg-slate-50 text-slate-600"
                      >
                        <option value="" disabled>Or pick from staff list...</option>
                        {staff.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name} ({s.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room / Venue</label>
                  <input
                    type="text"
                    value={form.room}
                    onChange={(e) => setForm({ ...form, room: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    placeholder="e.g. Room 101, Science Lab"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  Save Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT / CHANGE LESSON (CHANGE TIME, SUBJECT, TEACHER, ROOM)        */}
      {/* ========================================================================= */}
      {isEditModalOpen && editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-base font-['Outfit'] flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-amber-300" />
                  Change Lesson Details
                </h3>
                <p className="text-xs text-emerald-200">
                  {currentClassName} • {editingEntry.subject} ({editingEntry.day})
                </p>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingEntry(null);
                }}
                className="text-emerald-200 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateEntry} className="p-6 space-y-4 text-xs overflow-y-auto">
              {/* Day of Week */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Day of Week</label>
                <div className="grid grid-cols-5 gap-1">
                  {days.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setForm({ ...form, day: d })}
                      className={`py-2 text-center rounded-xl font-bold transition-all text-xs cursor-pointer ${
                        form.day === d
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {d.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lesson Timing: Start Time & End Time */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-700" />
                    Change Lesson Start & End Time
                  </span>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Duration: {formDurationMinutes} mins
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 text-[11px] mb-1">Start Time</label>
                    <input
                      type="time"
                      required
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 bg-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 text-[11px] mb-1">End Time</label>
                    <input
                      type="time"
                      required
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 bg-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>
                </div>

                {/* Quick Duration Setters */}
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block mb-1">Set Duration:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[30, 40, 45, 50, 60, 90].map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => handleSetDuration(dur)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          formDurationMinutes === dur
                            ? 'bg-emerald-800 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900'
                        }`}
                      >
                        +{dur} mins
                      </button>
                    ))}
                  </div>
                </div>

                {/* Standard Ghana School Period Presets */}
                <div className="pt-1">
                  <label className="block text-[10px] text-slate-500 font-semibold mb-1">Or apply standard period preset:</label>
                  <select
                    onChange={(e) => {
                      const found = STANDARD_PERIOD_PRESETS.find((p) => p.label === e.target.value);
                      if (found) handleApplyPreset(found);
                    }}
                    defaultValue=""
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800 font-medium"
                  >
                    <option value="" disabled>-- Select standard period preset --</option>
                    {STANDARD_PERIOD_PRESETS.map((p) => (
                      <option key={p.label} value={p.label}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject Input & Quick Suggestions */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Change Subject
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 font-bold text-sm"
                    placeholder="Enter or select subject..."
                  />

                  {/* Quick Subject Chips */}
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                      Pick another subject:
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
                      {allAvailableSubjects.map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => setForm({ ...form, subject: sub })}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                            form.subject.toLowerCase() === sub.toLowerCase()
                              ? 'bg-emerald-800 text-white font-bold'
                              : 'bg-white text-slate-700 hover:bg-emerald-100 hover:text-emerald-950 border border-slate-200'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Teacher and Room Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Teacher</label>
                  <input
                    type="text"
                    value={form.teacherName}
                    onChange={(e) => setForm({ ...form, teacherName: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 font-medium"
                    placeholder="Teacher name"
                  />
                  {staff.length > 0 && (
                    <div className="mt-1">
                      <select
                        onChange={(e) => {
                          if (e.target.value) setForm({ ...form, teacherName: e.target.value });
                        }}
                        defaultValue=""
                        className="w-full text-[10px] border border-slate-200 rounded-lg p-1 bg-slate-50 text-slate-600"
                      >
                        <option value="" disabled>Pick from staff list...</option>
                        {staff.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name} ({s.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room / Venue</label>
                  <input
                    type="text"
                    value={form.room}
                    onChange={(e) => setForm({ ...form, room: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    placeholder="e.g. Room 101, Science Lab"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    deleteTimetableEntry(editingEntry.id);
                    setIsEditModalOpen(false);
                    setEditingEntry(null);
                    showToast(`Deleted lesson from ${editingEntry.day}`);
                  }}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Lesson
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingEntry(null);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 text-amber-300" />
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: AUTO-GENERATE CURRICULUM TIMETABLE                               */}
      {/* ========================================================================= */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">Auto-Generate Timetable</h3>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will automatically populate a complete, balanced 5-day period schedule customized for{' '}
              <strong className="text-emerald-900 font-bold">{currentClassName}</strong> according to the Ghana
              National Curriculum standards (Creche, Kindergarten, Primary, or JHS).
            </p>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              <strong>Notice:</strong> Any existing slots for {currentClassName} will be replaced with the standard
              curriculum timetable.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyTemplate}
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Generate Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: COPY TIMETABLE FROM ANOTHER CLASS                                */}
      {/* ========================================================================= */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-emerald-800" />
                <h3 className="font-bold text-base text-slate-900">Copy Class Timetable</h3>
              </div>
              <button
                onClick={() => setIsCopyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCopySubmit} className="space-y-4 text-xs">
              <p className="text-slate-600">
                Duplicate the full period schedule from an existing class to{' '}
                <strong className="text-emerald-900">{currentClassName}</strong>.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Source Class:</label>
                <select
                  required
                  value={sourceClassToCopy}
                  onChange={(e) => setSourceClassToCopy(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 font-bold"
                >
                  <option value="">-- Choose Class to Copy From --</option>
                  {classes
                    .filter((c) => c.name !== currentClassName)
                    .map((c) => {
                      const count = timetable.filter((t) => t.className === c.name).length;
                      return (
                        <option key={c.id} value={c.name}>
                          {c.name} ({count} periods scheduled)
                        </option>
                      );
                    })}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCopyModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!sourceClassToCopy}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold rounded-xl cursor-pointer"
                >
                  Copy Timetable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: CLEAR CONFIRMATION                                               */}
      {/* ========================================================================= */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-slate-200 animate-in fade-in zoom-in-95 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Reset {currentClassName} Timetable?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This will remove all {classTimetable.length} scheduled periods for {currentClassName}. This action
                cannot be undone.
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setIsClearConfirmOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearClassTimetable(currentClassName);
                  setIsClearConfirmOpen(false);
                  showToast(`Cleared timetable for ${currentClassName}`);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Yes, Reset Timetable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
