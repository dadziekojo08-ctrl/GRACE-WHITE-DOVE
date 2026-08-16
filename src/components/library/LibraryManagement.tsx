import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Book, BookIssue } from '../../types';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Bookmark,
  CheckCircle,
  Clock,
  AlertTriangle,
  RotateCcw,
  UserCheck,
  X
} from 'lucide-react';

export const LibraryManagement: React.FC = () => {
  const { books, addBook, updateBook, bookIssues, issueBook, returnBook, students, staff } = useSchool();

  const [activeTab, setActiveTab] = useState<'catalog' | 'issued'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [targetBookToIssue, setTargetBookToIssue] = useState<Book | null>(null);

  // New book form
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'STEM & Robotics',
    totalCopies: 1,
    copiesAvailable: 1,
    shelfLocation: '',
    status: 'Available' as const
  });

  // Issue Form
  const [issueForm, setIssueForm] = useState({
    memberType: 'Student' as 'Student' | 'Staff',
    memberId: students[0]?.id || '',
    dueDays: 14
  });

  const categories = [
    'All Categories',
    'STEM & Robotics',
    'Mathematics & Statistics',
    'African Literature & Arts',
    'World History & Civics',
    'Natural Sciences & Biology'
  ];

  const filteredBooks = books.filter((b) => {
    return selectedCategory === 'all' || selectedCategory === 'All Categories' || b.category === selectedCategory;
  });

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    addBook({
      ...bookForm,
      copiesAvailable: bookForm.totalCopies,
      isbn: bookForm.isbn || `978-9988-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`
    });
    setIsAddBookOpen(false);
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBookToIssue) return;

    let memberName = '';
    if (issueForm.memberType === 'Student') {
      const std = students.find((s) => s.id === issueForm.memberId);
      memberName = std ? `${std.firstName} ${std.lastName}` : 'Student';
    } else {
      const stf = staff.find((s) => s.id === issueForm.memberId);
      memberName = stf ? stf.name : 'Staff';
    }

    issueBook(targetBookToIssue.id, issueForm.memberId, memberName, issueForm.memberType, issueForm.dueDays);
    setIsIssueModalOpen(false);
    setTargetBookToIssue(null);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">Library Management</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {books.length} Titles in Catalog
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage book lending, issue tracking, rack locations, and overdue reminders.
          </p>
        </div>

        <button
          onClick={() => setIsAddBookOpen(true)}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          Catalog New Book
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl text-xs font-bold gap-6">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'catalog'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Book Catalog ({books.length})
        </button>
        <button
          onClick={() => setActiveTab('issued')}
          className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'issued'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          Active Lending & Due Records ({bookIssues.length})
        </button>
      </div>

      {/* Tab 1: Catalog */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 text-xs">
            <span className="font-semibold text-slate-600">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {categories.map((c) => (
                <option key={c} value={c === 'All Categories' ? 'all' : c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooks.map((bk) => (
              <div
                key={bk.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {bk.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        bk.copiesAvailable > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {bk.copiesAvailable > 0 ? `${bk.copiesAvailable} Available` : 'Out of Stock'}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mt-2">{bk.title}</h3>
                  <p className="text-xs text-slate-500">by {bk.author}</p>

                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>ISBN:</span>
                      <span className="font-mono font-bold text-slate-800">{bk.isbn}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Rack Location:</span>
                      <span className="font-bold text-emerald-900 bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                        {bk.shelfLocation}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setTargetBookToIssue(bk);
                      setIsIssueModalOpen(true);
                    }}
                    disabled={bk.copiesAvailable <= 0}
                    className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Issue Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Active Lending Records */}
      {activeTab === 'issued' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-emerald-900 text-white uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Borrower</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Fine (GHS)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookIssues.map((iss) => (
                  <tr key={iss.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{iss.bookTitle}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{iss.memberName}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {iss.memberType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{iss.issueDate}</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-800">{iss.dueDate}</td>
                    <td className="py-3 px-4 font-mono font-bold text-red-600">
                      {iss.fineAmount > 0 ? `GHS ${iss.fineAmount}` : 'None'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          iss.status === 'Returned'
                            ? 'bg-emerald-100 text-emerald-800'
                            : iss.status === 'Overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {iss.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {iss.status !== 'Returned' && (
                        <button
                          onClick={() => returnBook(iss.id)}
                          className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" /> Return Book
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {isAddBookOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base font-['Outfit']">Catalog New Library Book</h3>
              <button onClick={() => setIsAddBookOpen(false)} className="text-white">✕</button>
            </div>
            <form onSubmit={handleAddBook} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  placeholder="e.g. Clean Code"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Author Name *</label>
                <input
                  type="text"
                  required
                  value={bookForm.author}
                  onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={bookForm.category}
                    onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  >
                    {categories.filter((c) => c !== 'All Categories').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Copies</label>
                  <input
                    type="number"
                    min={1}
                    value={bookForm.totalCopies}
                    onChange={(e) => setBookForm({ ...bookForm, totalCopies: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rack / Shelf Location</label>
                <input
                  type="text"
                  value={bookForm.shelfLocation}
                  onChange={(e) => setBookForm({ ...bookForm, shelfLocation: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  placeholder="e.g. Rack B2-01"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddBookOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl"
                >
                  Add Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Book Modal */}
      {isIssueModalOpen && targetBookToIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base font-['Outfit']">Issue Book to Member</h3>
                <p className="text-xs text-emerald-200">{targetBookToIssue.title}</p>
              </div>
              <button onClick={() => setIsIssueModalOpen(false)} className="text-white">✕</button>
            </div>
            <form onSubmit={handleIssueSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Borrower Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIssueForm({ ...issueForm, memberType: 'Student', memberId: students[0]?.id || '' })}
                    className={`py-2 rounded-lg font-bold border ${
                      issueForm.memberType === 'Student'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-400/30'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setIssueForm({ ...issueForm, memberType: 'Staff', memberId: staff[0]?.id || '' })}
                    className={`py-2 rounded-lg font-bold border ${
                      issueForm.memberType === 'Staff'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-400/30'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Staff / Teacher
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Borrower</label>
                <select
                  value={issueForm.memberId}
                  onChange={(e) => setIssueForm({ ...issueForm, memberId: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                >
                  {issueForm.memberType === 'Student'
                    ? students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.firstName} {s.lastName} ({s.className})
                        </option>
                      ))
                    : staff.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.designation})
                        </option>
                      ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lending Duration (Days)</label>
                <select
                  value={issueForm.dueDays}
                  onChange={(e) => setIssueForm({ ...issueForm, dueDays: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                >
                  <option value={7}>7 Days (1 Week)</option>
                  <option value={14}>14 Days (2 Weeks - Standard)</option>
                  <option value={30}>30 Days (1 Month - Research)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
