import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Announcement } from '../../types';
import {
  Bell,
  Plus,
  Search,
  Users,
  Megaphone,
  AlertTriangle,
  Calendar,
  MessageSquare,
  Send,
  Pin,
  Trash2,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  Lock,
  GraduationCap
} from 'lucide-react';

export const AnnouncementCenter: React.FC = () => {
  const { announcements, addAnnouncement, deleteAnnouncement, currentUser, activeRole, academicYear, currentTerm } = useSchool();
  const [selectedAudience, setSelectedAudience] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const isTeacher = activeRole === 'Teacher';

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'Medium' as Announcement['priority'],
    targetAudience: 'All' as Announcement['targetAudience'],
    postedBy: currentUser?.name || 'Diana Adu-Boahen (Head of School)',
    pinned: false
  });

  const isHeadOfSchoolAnnouncement = (a: Announcement) => {
    const auth = (a.postedBy || a.author || '').toLowerCase();
    const title = (a.title || '').toLowerCase();
    const cat = (a.category || '').toLowerCase();
    return (
      auth.includes('head of school') ||
      auth.includes('diana') ||
      auth.includes('adu-boahen') ||
      auth.includes('principal') ||
      auth.includes('headmaster') ||
      auth.includes('academic directorate') ||
      title.includes('head of school') ||
      cat.includes('directive')
    );
  };

  const visibleAnnouncements = isTeacher
    ? announcements.filter(isHeadOfSchoolAnnouncement)
    : announcements;

  const filteredAnnouncements = visibleAnnouncements.filter((a) => {
    const textBody = a.content || a.message || '';
    const authorName = a.postedBy || a.author || '';
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      textBody.toLowerCase().includes(searchQuery.toLowerCase()) ||
      authorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAudience = selectedAudience === 'All' || a.targetAudience === selectedAudience || a.targetAudience === 'All';
    return matchesSearch && matchesAudience;
  });

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (isTeacher) return; // Teachers cannot create announcements
    if (!formData.title || !formData.content) return;

    addAnnouncement({
      title: formData.title,
      content: formData.content,
      message: formData.content,
      priority: formData.priority,
      targetAudience: formData.targetAudience,
      postedBy: formData.postedBy,
      author: formData.postedBy,
      pinned: formData.pinned
    });

    setFormData({
      title: '',
      content: '',
      priority: 'Medium',
      targetAudience: 'All',
      postedBy: currentUser?.name || 'Diana Adu-Boahen (Head of School)',
      pinned: false
    });
    setIsAddModalOpen(false);
  };

  const getPriorityBadge = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'High':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
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
                {isTeacher ? 'Head of School Directives' : 'Notice Board & Comms'}
              </span>
              <span className="text-emerald-300 text-xs font-medium">
                {academicYear} • {currentTerm}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {isTeacher ? 'Head of School Announcements' : 'Announcements & Circulars'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl">
              {isTeacher
                ? 'Official executive circulars, academic directives, and administrative memos issued exclusively by the Head of School.'
                : 'Official circulars, staff meeting briefs, exam directives, and emergency parent notifications.'}
            </p>
          </div>

          {!isTeacher ? (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Announcement
            </button>
          ) : (
            <div className="bg-emerald-900/80 border border-emerald-700/60 px-3.5 py-2 rounded-xl text-xs text-emerald-200 flex items-center gap-2 shrink-0">
              <Lock className="w-4 h-4 text-amber-400" />
              <span className="font-medium text-[11px]">Teacher Portal • Read-Only Directives</span>
            </div>
          )}
        </div>
      </div>

      {/* Notice Info Pill for Teachers */}
      {isTeacher && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-950">
          <div className="w-9 h-9 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-900">Executive Channel from the Head of School</h4>
            <p className="text-[11px] text-amber-800/80 mt-0.5">
              Only verified administrative circulars and instructions from the Head of School are broadcast to the Teacher workspace. Teachers do not have publishing privileges on this channel.
            </p>
          </div>
        </div>
      )}

      {/* Main Notice List */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search circulars, title, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-800 w-64"
            />
          </div>

          {!isTeacher && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {['All', 'Teachers', 'Parents', 'Students'].map((aud) => (
                <button
                  key={aud}
                  onClick={() => setSelectedAudience(aud)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedAudience === aud
                      ? 'bg-emerald-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {aud}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notices Cards */}
        <div className="space-y-3">
          {filteredAnnouncements.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Megaphone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No announcements found matching your criteria</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isTeacher ? 'Official circulars from the Head of School will appear here.' : 'Create a new announcement to broadcast to staff, students, or parents.'}
              </p>
            </div>
          ) : (
            filteredAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className={`p-5 rounded-2xl border transition-all ${
                  ann.pinned
                    ? 'bg-amber-50/40 border-amber-200/80 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-emerald-700/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        ann.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-700'
                          : ann.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      <Megaphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        {ann.pinned && (
                          <span className="bg-amber-400 text-emerald-950 text-[10px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1">
                            <Pin className="w-3 h-3 fill-current" /> Pinned Notice
                          </span>
                        )}
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${getPriorityBadge(ann.priority)}`}>
                          {ann.priority} Priority
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Audience: {ann.targetAudience}
                        </span>
                        {isTeacher && (
                          <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                            Verified Head of School Directive
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mt-2">{ann.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-line">
                        {ann.content || ann.message}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
                        <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                          Posted by: {ann.postedBy || ann.author || 'Diana Adu-Boahen (Head of School)'}
                        </span>
                        <span>•</span>
                        <span>Date: {ann.date}</span>
                      </div>
                    </div>
                  </div>

                  {!isTeacher && (
                    <button
                      onClick={() => deleteAnnouncement(ann.id)}
                      className="text-slate-300 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                      title="Remove Notice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Announcement Modal (Only accessible for non-teachers) */}
      {!isTeacher && isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Post Announcement</h3>
            <p className="text-xs text-slate-500 mb-4">Send a notice to teachers, pupils, or parents</p>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End of Term Staff Evaluation Meeting"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  >
                    <option value="All">Everyone</option>
                    <option value="Teachers">Teachers Only</option>
                    <option value="Parents">Parents Only</option>
                    <option value="Students">Students Only</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Publishing Authority / Author</label>
                <input
                  type="text"
                  required
                  value={formData.postedBy}
                  onChange={(e) => setFormData({ ...formData, postedBy: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write notice details..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={formData.pinned}
                  onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-800"
                />
                <label htmlFor="pinCheck" className="text-xs font-semibold text-slate-700">
                  Pin to top of notice board
                </label>
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
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

