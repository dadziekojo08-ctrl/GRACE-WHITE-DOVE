import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Announcement } from '../../types';
import {
  MessageSquare,
  Send,
  Phone,
  Mail,
  Megaphone,
  Plus,
  Trash2,
  CheckCircle,
  Users,
  Smartphone,
  X
} from 'lucide-react';

export const CommunicationSuite: React.FC = () => {
  const {
    announcements,
    addAnnouncement,
    deleteAnnouncement,
    communicationLogs,
    sendBroadcast,
    students,
    staff
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'announcements' | 'broadcast' | 'logs'>('announcements');
  const [isNewAnnModalOpen, setIsNewAnnModalOpen] = useState(false);

  // New announcement form
  const [annForm, setAnnForm] = useState({
    title: '',
    message: '',
    category: 'Academics',
    targetAudience: 'All' as Announcement['targetAudience'],
    priority: 'Normal' as Announcement['priority'],
    author: 'Principal Office'
  });

  // Broadcast form
  const [broadcastForm, setBroadcastForm] = useState({
    channel: 'WhatsApp' as 'WhatsApp' | 'Email' | 'SMS',
    targetGroup: 'All Parents',
    subject: '',
    message: ''
  });

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    addAnnouncement(annForm);
    setIsNewAnnModalOpen(false);
    setAnnForm({
      title: '',
      message: '',
      category: 'Academics',
      targetAudience: 'All',
      priority: 'Normal',
      author: 'Principal Office'
    });
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (broadcastForm.targetGroup === 'All Parents') {
      students.slice(0, 5).forEach((s) => {
        sendBroadcast({
          channel: broadcastForm.channel,
          recipient: broadcastForm.channel === 'Email' ? s.guardianEmail : s.guardianPhone,
          recipientName: s.guardianName,
          subject: broadcastForm.subject,
          message: broadcastForm.message
        });
      });
    } else {
      staff.slice(0, 5).forEach((st) => {
        sendBroadcast({
          channel: broadcastForm.channel,
          recipient: broadcastForm.channel === 'Email' ? st.email : st.phone,
          recipientName: st.name,
          subject: broadcastForm.subject,
          message: broadcastForm.message
        });
      });
    }
    alert(`Dispatched ${broadcastForm.channel} broadcast transmission successfully!`);
    setActiveTab('logs');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">Communication Suite</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Email • WhatsApp • SMS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch multi-channel emergency notices, PTA bulletins, and automated WhatsApp payment reminders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewAnnModalOpen(true)}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Megaphone className="w-4 h-4 text-amber-300" />
            Post Announcement
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl text-xs font-bold gap-6">
        <button
          onClick={() => setActiveTab('announcements')}
          className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'announcements'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          School Notice Board ({announcements.length})
        </button>
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'broadcast'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Send className="w-4 h-4" />
          Broadcast Messenger
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'logs'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Delivery Logs ({communicationLogs.length})
        </button>
      </div>

      {/* Tab 1: Notice Board */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          ann.priority === 'Urgent'
                            ? 'bg-red-100 text-red-800'
                            : ann.priority === 'High'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {ann.priority}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Audience: {ann.targetAudience}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteAnnouncement(ann.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                      title="Delete Notice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mt-3">{ann.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{ann.message}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Author: <strong className="text-slate-700">{ann.author}</strong></span>
                  <span className="font-mono">{ann.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Broadcast Messenger with Live Mockup */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 font-['Outfit']">Compose Multi-Channel Transmission</h3>

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Select Transmission Channel</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['WhatsApp', 'Email', 'SMS'] as const).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setBroadcastForm({ ...broadcastForm, channel: ch })}
                      className={`py-2.5 rounded-xl font-bold border flex items-center justify-center gap-1.5 transition-all ${
                        broadcastForm.channel === ch
                          ? ch === 'WhatsApp'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-amber-400 text-emerald-950 border-amber-400 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {ch === 'WhatsApp' && <Phone className="w-3.5 h-3.5" />}
                      {ch === 'Email' && <Mail className="w-3.5 h-3.5" />}
                      {ch === 'SMS' && <MessageSquare className="w-3.5 h-3.5" />}
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Recipients</label>
                <select
                  value={broadcastForm.targetGroup}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, targetGroup: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                >
                  <option value="All Parents">All Enrolled Parents & Guardians</option>
                  <option value="Teaching Staff">Teaching Faculty & Staff</option>
                  <option value="Grade 8 Parents">Grade 8 Parents Only</option>
                </select>
              </div>

              {broadcastForm.channel === 'Email' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Subject Header</label>
                  <input
                    type="text"
                    required
                    value={broadcastForm.subject}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, subject: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message Content *</label>
                <textarea
                  required
                  rows={4}
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 text-amber-300" />
                Dispatch Instant Transmission ({broadcastForm.channel})
              </button>
            </form>
          </div>

          {/* Live Mobile Phone Mockup */}
          <div className="lg:col-span-5 bg-slate-100 rounded-2xl p-6 border border-slate-200 flex flex-col items-center justify-center">
            <div className="w-64 bg-slate-900 rounded-[32px] p-3 shadow-xl border-4 border-slate-800 text-white">
              {/* Screen */}
              <div className="bg-[#0b141a] rounded-[24px] overflow-hidden flex flex-col h-[400px]">
                {/* Status Bar */}
                <div className="px-4 py-1.5 bg-[#1f2c34] flex justify-between items-center text-[9px] text-slate-300">
                  <span>9:41 AM</span>
                  <div className="flex items-center gap-1">
                    <span>5G</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* WhatsApp Header */}
                <div className="px-3 py-2 bg-[#1f2c34] border-b border-slate-700 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-700 text-amber-300 font-bold flex items-center justify-center text-[10px]">
                    GWD
                  </div>
                  <div>
                    <span className="font-bold text-[11px] block leading-tight">Grace White Dove School Complex</span>
                    <span className="text-[9px] text-emerald-400">Official Notification Hub</span>
                  </div>
                </div>

                {/* Chat Bubble Body */}
                <div className="flex-1 p-3 flex flex-col justify-end space-y-2 overflow-y-auto">
                  <div className="bg-[#005c4b] text-white p-2.5 rounded-xl rounded-tl-none max-w-[90%] text-[10px] leading-relaxed shadow-sm">
                    {broadcastForm.channel === 'Email' && (
                      <strong className="block text-amber-300 mb-1">{broadcastForm.subject}</strong>
                    )}
                    <p>{broadcastForm.message}</p>
                    <span className="text-[8px] text-slate-300 block text-right mt-1 font-mono">9:41 AM ✓✓</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-3 font-semibold">Live Real-time Delivery Preview</p>
          </div>
        </div>
      )}

      {/* Tab 3: Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-emerald-900 text-white uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Recipient Name</th>
                  <th className="py-3 px-4">Contact Detail</th>
                  <th className="py-3 px-4">Subject / Excerpt</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {communicationLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          log.channel === 'WhatsApp'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.channel === 'Email'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {log.channel}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.recipientName}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{log.recipient}</td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate">{log.message}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{log.timestamp}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Notice Modal */}
      {isNewAnnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base font-['Outfit']">Post School Bulletin Announcement</h3>
              <button onClick={() => setIsNewAnnModalOpen(false)} className="text-white">✕</button>
            </div>
            <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bulletin Title *</label>
                <input
                  type="text"
                  required
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  placeholder="e.g. Annual Sports Festival & Inter-House Games"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={annForm.targetAudience}
                    onChange={(e) => setAnnForm({ ...annForm, targetAudience: e.target.value as Announcement['targetAudience'] })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  >
                    <option value="All">All School Community</option>
                    <option value="Parents">Parents Only</option>
                    <option value="Teachers">Teachers Only</option>
                    <option value="Students">Students Only</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={annForm.priority}
                    onChange={(e) => setAnnForm({ ...annForm, priority: e.target.value as Announcement['priority'] })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent Alert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Announcement Details *</label>
                <textarea
                  required
                  rows={4}
                  value={annForm.message}
                  onChange={(e) => setAnnForm({ ...annForm, message: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  placeholder="Detailed information..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewAnnModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl"
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
