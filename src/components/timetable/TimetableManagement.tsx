import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { TimetableEntry, ClassRoom } from '../../types';
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
  Users
} from 'lucide-react';

export const TimetableManagement: React.FC = () => {
  const {
    timetable,
    addTimetableEntry,
    updateTimetableEntry,
    deleteTimetableEntry,
    clearClassTimetable,
    copyClassTimetable,
    setFullClassTimetable,
    classes,
    staff,
    selectedTimetableClass,
    setSelectedTimetableClass,
    academicYear,
    currentUser
  } = useSchool();

  // Active selected class name
  const currentClassName = selectedTimetableClass || (classes.length > 0 ? classes[0].name : 'Creche');
  const currentClassObj = classes.find((c) => c.name === currentClassName) || classes[0];

  // View modes
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>('weekly');
  const [activeDayTab, setActiveDayTab] = useState<TimetableEntry['day']>('Monday');

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

  // Form State for Slot Add / Edit
  const [form, setForm] = useState({
    day: 'Monday' as TimetableEntry['day'],
    timeSlot: '08:00 - 08:50',
    subject: 'Mathematics',
    teacherName: '',
    room: ''
  });

  const days: TimetableEntry['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Standard Ghanaian School Time Slots (Creche to JHS)
  const timeSlots = [
    '08:00 - 08:50', // Period 1
    '08:50 - 09:40', // Period 2
    '09:40 - 10:30', // Period 3
    '10:30 - 11:00', // Snack / Recess Break
    '11:00 - 11:50', // Period 4
    '11:50 - 12:40', // Period 5
    '12:40 - 13:30', // Midday Lunch Break
    '13:30 - 14:20', // Period 6
    '14:20 - 15:10'  // Period 7 / Closing Assembly
  ];

  const teachingTimeSlots = timeSlots.filter(
    (slot) => !slot.includes('10:30 - 11:00') && !slot.includes('12:40 - 13:30')
  );

  // Filter timetable for currently selected class
  const classTimetable = timetable.filter((t) => t.className === currentClassName);

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
    // Find if same teacher is scheduled in another class at same day + timeSlot
    const duplicate = timetable.find(
      (other) =>
        other.id !== entry.id &&
        other.teacherName.trim().toLowerCase() === entry.teacherName.trim().toLowerCase() &&
        other.day === entry.day &&
        other.timeSlot === entry.timeSlot
    );
    return !!duplicate;
  });

  // Open modal with prefilled day & timeSlot
  const handleOpenAddForSlot = (day: TimetableEntry['day'], timeSlot: string) => {
    const defaultSubject =
      currentClassObj?.subjects && currentClassObj.subjects.length > 0
        ? currentClassObj.subjects[0]
        : 'Mathematics';

    const defaultTeacher = currentClassObj?.classTeacher || (staff[0] ? staff[0].name : '');
    const defaultRoom = currentClassObj?.roomNumber || 'Room 101';

    setForm({
      day,
      timeSlot,
      subject: defaultSubject,
      teacherName: defaultTeacher,
      room: defaultRoom
    });
    setIsAddModalOpen(true);
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    addTimetableEntry({
      className: currentClassName,
      day: form.day,
      timeSlot: form.timeSlot,
      subject: form.subject.trim(),
      teacherName: form.teacherName.trim() || 'Class Teacher',
      room: form.room.trim() || currentClassObj?.roomNumber || 'Classroom'
    });
    setIsAddModalOpen(false);
    showToast(`Added ${form.subject} on ${form.day} (${form.timeSlot}) for ${currentClassName}`);
  };

  const handleOpenEdit = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setForm({
      day: entry.day,
      timeSlot: entry.timeSlot,
      subject: entry.subject,
      teacherName: entry.teacherName,
      room: entry.room
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    updateTimetableEntry(editingEntry.id, {
      day: form.day,
      timeSlot: form.timeSlot,
      subject: form.subject.trim(),
      teacherName: form.teacherName.trim(),
      room: form.room.trim()
    });
    setIsEditModalOpen(false);
    setEditingEntry(null);
    showToast(`Updated timetable period for ${currentClassName}`);
  };

  // Auto-generate template based on level (Ghana GES curriculum)
  const handleApplyTemplate = () => {
    const levelLower = currentClassObj?.level?.toLowerCase() || '';
    const nameLower = currentClassName.toLowerCase();
    const classTeacher = currentClassObj?.classTeacher || 'Class Teacher';
    const room = currentClassObj?.roomNumber || 'Classroom';

    let scheduleTemplate: Omit<TimetableEntry, 'id'>[] = [];

    if (levelLower.includes('creche') || nameLower.includes('creche')) {
      // Creche schedule: Play-based, sensory, rhymes, motor skills, rest
      const crecheSubjects = [
        ['Circle Time & Rhymes', 'Sensory Play', 'Early Phonics', 'Creative Drawing', 'Outdoor Play'], // Mon
        ['Story & Language', 'Motor Skills', 'Rhymes & Music', 'Play Dough & Art', 'Nap & Free Play'], // Tue
        ['Counting & Shapes', 'Sensory Exploration', 'Phonics Songs', 'Water Play', 'Picture Books'], // Wed
        ['Early Phonics', 'Creative Movements', 'Rhymes & Poems', 'Block Building', 'Outdoor Play'], // Thu
        ['Show & Tell', 'Sensory Activities', 'Rhymes & Singing', 'Free Play & Games', 'Storytime']  // Fri
      ];

      days.forEach((day, dIdx) => {
        teachingTimeSlots.slice(0, 5).forEach((slot, sIdx) => {
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
      // Nursery / KG schedule
      const kgSubjects = [
        ['Phonics & Sounds', 'Numeracy & Counting', 'Our World Our People', 'Rhymes & Poetry', 'Creative Arts', 'Indoor Games', 'Storytelling'],
        ['Writing Readiness', 'Number Work', 'Phonics & Reading', 'Science Discovery', 'Music & Movement', 'Coloring & Art', 'Free Play'],
        ['Phonics & Sounds', 'Numeracy Activities', 'Our World Our People', 'Physical Development', 'Rhymes & Singing', 'Sensory Math', 'Story Time'],
        ['Letter Formation', 'Counting & Matching', 'Phonics & Reading', 'Creative Crafts', 'Our World Our People', 'Indoor Activities', 'Reading Corner'],
        ['Phonics Review', 'Fun Mathematics', 'Science & Nature', 'Cultural Rhymes', 'Creative Drama', 'Outdoor Sports', 'Closing Circle']
      ];

      days.forEach((day, dIdx) => {
        teachingTimeSlots.forEach((slot, sIdx) => {
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
      // JHS schedule: Core Maths, Integrated Science, English, Social Studies, ICT, RME, French, Career Tech, Creative Arts
      const jhsWeeklyPlan = [
        ['Mathematics', 'English Language', 'Integrated Science', 'Social Studies', 'ICT (Computing)', 'Career Technology', 'French'],
        ['Integrated Science', 'Mathematics', 'English Language', 'RME', 'Creative Arts & Design', 'Ghanaian Language', 'Social Studies'],
        ['English Language', 'Social Studies', 'Mathematics', 'Integrated Science', 'Career Technology', 'ICT (Computing)', 'Physical Education'],
        ['Mathematics', 'Integrated Science', 'English Language', 'French', 'Social Studies', 'RME', 'Creative Arts & Design'],
        ['English Language', 'Mathematics', 'Integrated Science', 'ICT Lab Practical', 'Ghanaian Language', 'Social Studies', 'Clubs & Societies']
      ];

      days.forEach((day, dIdx) => {
        teachingTimeSlots.forEach((slot, sIdx) => {
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
      // Primary 1 to 6 schedule
      const primaryWeeklyPlan = [
        ['Mathematics', 'English Language', 'Natural Science', 'Our World Our People', 'Computing (ICT)', 'RME', 'Creative Arts'],
        ['English Language', 'Mathematics', 'Natural Science', 'Ghanaian Language', 'Our World Our People', 'History of Ghana', 'Physical Education'],
        ['Mathematics', 'English Language', 'Computing (ICT)', 'Natural Science', 'Creative Arts', 'Our World Our People', 'Library & Reading'],
        ['English Language', 'Mathematics', 'Natural Science', 'RME', 'Ghanaian Language', 'Our World Our People', 'French / Phonics'],
        ['Mathematics', 'English Language', 'Natural Science', 'Computing (ICT)', 'Creative Arts & Crafts', 'Our World Our People', 'Clubs & Worship']
      ];

      days.forEach((day, dIdx) => {
        teachingTimeSlots.forEach((slot, sIdx) => {
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

  // Subject Badge Color Palette
  const getSubjectBadgeColor = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('math')) return 'bg-blue-50 text-blue-900 border-blue-200';
    if (s.includes('science')) return 'bg-emerald-50 text-emerald-900 border-emerald-200';
    if (s.includes('english') || s.includes('phonics') || s.includes('reading')) return 'bg-amber-50 text-amber-950 border-amber-200';
    if (s.includes('social') || s.includes('world') || s.includes('people') || s.includes('history')) return 'bg-purple-50 text-purple-900 border-purple-200';
    if (s.includes('ict') || s.includes('computing')) return 'bg-cyan-50 text-cyan-900 border-cyan-200';
    if (s.includes('rme') || s.includes('religious')) return 'bg-indigo-50 text-indigo-900 border-indigo-200';
    if (s.includes('art') || s.includes('creative') || s.includes('rhymes') || s.includes('music')) return 'bg-rose-50 text-rose-900 border-rose-200';
    if (s.includes('french') || s.includes('ghanaian')) return 'bg-teal-50 text-teal-900 border-teal-200';
    return 'bg-slate-50 text-slate-800 border-slate-200';
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

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                Class Timetable Administration
                <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Creche to JHS
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Each classroom manages its own weekly period grid, subject schedules, and teacher allocations.
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 flex-wrap">
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
            Add Period Slot
          </button>
        </div>
      </div>

      {/* Class Switcher & Department Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-emerald-800" />
            <label htmlFor="class-select-dropdown" className="font-bold text-slate-800 text-xs">Administering Timetable For:</label>
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
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              )}

              {primaryClasses.length > 0 && (
                <optgroup label="Primary Department (Class 1 to 6)">
                  {primaryClasses.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              )}

              {jhsClasses.length > 0 && (
                <optgroup label="Junior High School (JHS 1 to 3)">
                  {jhsClasses.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* View Mode Toggle: Weekly Master vs Daily Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'weekly' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              5-Day Grid
            </button>
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'daily' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Day-by-Day
            </button>
          </div>
        </div>

        {/* Selected Class Snapshot Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <User className="w-4 h-4 text-emerald-700 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Class Teacher</span>
              <span className="font-bold text-slate-800 truncate block">
                {currentClassObj?.classTeacher || 'Unassigned'}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Assigned Room</span>
              <span className="font-bold text-slate-800 truncate block">
                {currentClassObj?.roomNumber || 'Block A'}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <Building className="w-4 h-4 text-slate-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Desk Capacity</span>
              <span className="font-bold text-slate-900 font-mono">
                {currentClassObj?.capacity || 35} Desks
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-800 shrink-0" />
              <div>
                <span className="text-[10px] text-emerald-700 block uppercase font-bold">Periods Scheduled</span>
                <span className="font-bold text-emerald-950 font-mono text-xs">
                  {classTimetable.length} Slots
                </span>
              </div>
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
                  <th className="py-3.5 px-4 w-36 border-r border-emerald-800">Time Period</th>
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
                {timeSlots.map((slot) => {
                  const isBreak = slot.includes('10:30 - 11:00');
                  const isLunch = slot.includes('12:40 - 13:30');

                  if (isBreak || isLunch) {
                    return (
                      <tr key={slot} className="bg-amber-50/80 text-amber-950 font-bold border-y border-amber-200">
                        <td className="py-2.5 px-4 font-mono text-[11px] border-r border-amber-200 text-amber-900 bg-amber-100/50">
                          {slot}
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
                      </td>

                      {days.map((day) => {
                        const entry = classTimetable.find((t) => t.day === day && t.timeSlot === slot);

                        return (
                          <td key={day} className="py-2 px-2.5 border-r border-slate-200 last:border-0 align-top min-w-[130px]">
                            {entry ? (
                              <div
                                className={`p-2.5 rounded-xl border relative group transition-all hover:shadow-xs ${getSubjectBadgeColor(
                                  entry.subject
                                )}`}
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <span className="font-bold block text-xs leading-tight line-clamp-2">
                                    {entry.subject}
                                  </span>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => handleOpenEdit(entry)}
                                      className="p-1 text-slate-600 hover:text-emerald-900 hover:bg-white rounded cursor-pointer"
                                      title="Edit Period Slot"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => deleteTimetableEntry(entry.id)}
                                      className="p-1 text-rose-600 hover:text-rose-900 hover:bg-white rounded cursor-pointer"
                                      title="Remove Period Slot"
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
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleOpenAddForSlot(day, slot)}
                                className="w-full h-16 border border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-emerald-800 transition-all text-[11px] font-medium group cursor-pointer"
                                title={`Add ${day} period`}
                              >
                                <Plus className="w-4 h-4 text-slate-300 group-hover:text-emerald-700 transition-colors" />
                                <span className="text-[10px] text-slate-400 group-hover:text-emerald-700">Add Slot</span>
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
              Add {activeDayTab} Slot
            </button>
          </div>

          <div className="space-y-2.5">
            {timeSlots.map((slot) => {
              const isBreak = slot.includes('10:30 - 11:00');
              const isLunch = slot.includes('12:40 - 13:30');

              if (isBreak || isLunch) {
                return (
                  <div
                    key={slot}
                    className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs text-amber-950 font-bold"
                  >
                    <span className="font-mono text-amber-800">{slot}</span>
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
                    <div className="w-28 font-mono text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-center shrink-0">
                      {slot}
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
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTimetableEntry(entry.id)}
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
                        <Plus className="w-3 h-3 text-emerald-700" />
                        Assign Subject
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
      {/* MODAL 1: ADD PERIOD SLOT                                                 */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base font-['Outfit']">Add Timetable Period</h3>
                <p className="text-xs text-emerald-200">Class: {currentClassName}</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-emerald-200 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddEntry} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Day of Week</label>
                  <select
                    value={form.day}
                    onChange={(e) => setForm({ ...form, day: e.target.value as TimetableEntry['day'] })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 font-medium"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time Period Slot</label>
                  <select
                    value={form.timeSlot}
                    onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 font-mono font-bold"
                  >
                    {teachingTimeSlots.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Name</label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 font-bold"
                    placeholder="e.g. Mathematics, Integrated Science"
                  />
                  {currentClassObj?.subjects && currentClassObj.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      <span className="text-[10px] text-slate-400 mr-1">Quick fill:</span>
                      {currentClassObj.subjects.slice(0, 6).map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => setForm({ ...form, subject: sub })}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 rounded-md text-[10px] text-slate-700 transition-colors"
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Teacher</label>
                  <select
                    value={form.teacherName}
                    onChange={(e) => setForm({ ...form, teacherName: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  >
                    <option value={currentClassObj?.classTeacher || 'Class Teacher'}>
                      {currentClassObj?.classTeacher || 'Class Teacher'} (Class Master)
                    </option>
                    {staff
                      .filter((s) => s.name !== currentClassObj?.classTeacher)
                      .map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name} ({s.department || s.role})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room / Location</label>
                  <input
                    type="text"
                    value={form.room}
                    onChange={(e) => setForm({ ...form, room: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    placeholder="e.g. Block B - Room 101"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl cursor-pointer shadow-sm"
                >
                  Save Period Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT PERIOD SLOT                                                 */}
      {/* ========================================================================= */}
      {isEditModalOpen && editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base font-['Outfit']">Edit Timetable Period</h3>
                <p className="text-xs text-emerald-200">{currentClassName}</p>
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
            <form onSubmit={handleUpdateEntry} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Day of Week</label>
                  <select
                    value={form.day}
                    onChange={(e) => setForm({ ...form, day: e.target.value as TimetableEntry['day'] })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 font-medium"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time Period Slot</label>
                  <select
                    value={form.timeSlot}
                    onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 font-mono font-bold"
                  >
                    {teachingTimeSlots.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teacher</label>
                  <input
                    type="text"
                    value={form.teacherName}
                    onChange={(e) => setForm({ ...form, teacherName: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room / Location</label>
                  <input
                    type="text"
                    value={form.room}
                    onChange={(e) => setForm({ ...form, room: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    deleteTimetableEntry(editingEntry.id);
                    setIsEditModalOpen(false);
                    setEditingEntry(null);
                  }}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Slot
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
                    className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl cursor-pointer"
                  >
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
