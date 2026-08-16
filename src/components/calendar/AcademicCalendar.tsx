import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { CalendarEvent } from '../../types';
import {
  CalendarDays,
  Plus,
  Search,
  Clock,
  MapPin,
  Users,
  Tag,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  Sparkles
} from 'lucide-react';

export const AcademicCalendar: React.FC = () => {
  const { calendarEvents, addCalendarEvent, deleteCalendarEvent, academicYear, currentTerm } = useSchool();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    category: 'Academic' as CalendarEvent['category'],
    targetAudience: 'All' as CalendarEvent['targetAudience'],
    location: '',
    isHoliday: false
  });

  const categories = ['All', 'Academic', 'Examination', 'Holiday', 'Meeting', 'Sports', 'Cultural'] as const;

  const filteredEvents = calendarEvents.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.description && ev.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ev.location && ev.location.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || ev.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.startDate) return;

    addCalendarEvent({
      title: formData.title,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate || formData.startDate,
      category: formData.category,
      targetAudience: formData.targetAudience,
      location: formData.location,
      isHoliday: formData.isHoliday
    });

    setFormData({
      title: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      category: 'Academic',
      targetAudience: 'All',
      location: 'Main School Hall',
      isHoliday: false
    });
    setIsAddModalOpen(false);
  };

  const getCategoryColor = (cat: CalendarEvent['category']) => {
    switch (cat) {
      case 'Examination':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Holiday':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'Meeting':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Sports':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Cultural':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-emerald-50 text-emerald-900 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 p-6 text-white shadow-md border border-emerald-700/60">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-emerald-950 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Institutional Schedule
              </span>
              <span className="text-emerald-300 text-xs font-medium">
                {academicYear} • {currentTerm}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Academic Calendar & Term Dates
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl">
              Term timelines, examination weeks, PTA assemblies, public holidays, and inter-house athletic fixtures.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add School Event
          </button>
        </div>
      </div>

      {/* Main Filter & Event List */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search events, exams, venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-800 w-64"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-700/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getCategoryColor(
                      ev.category
                    )}`}
                  >
                    {ev.category}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    For: {ev.targetAudience}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2.5 group-hover:text-emerald-900 transition-colors">
                  {ev.title}
                </h3>
                {ev.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ev.description}</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="font-semibold text-slate-800">
                    {ev.startDate} {ev.endDate && ev.endDate !== ev.startDate && `to ${ev.endDate}`}
                  </span>
                </div>
                {ev.location && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{ev.location}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Academic Event</h3>
            <p className="text-xs text-slate-500 mb-4">Post a calendar milestone or school gathering</p>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End of Term Examination"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Examination">Examination</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Sports">Sports</option>
                    <option value="Cultural">Cultural</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  >
                    <option value="All">All School</option>
                    <option value="Teachers">Teachers Only</option>
                    <option value="Parents">Parents & Guardians</option>
                    <option value="Students">Students Only</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Venue / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Main Auditorium"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief details about the activity..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  Post Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
