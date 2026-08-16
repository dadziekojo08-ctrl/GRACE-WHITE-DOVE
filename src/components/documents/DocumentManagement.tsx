import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { SchoolDocument } from '../../types';
import {
  FolderOpen,
  FileText,
  UploadCloud,
  Download,
  Trash2,
  Lock,
  Search,
  Plus,
  Eye,
  CheckCircle,
  File,
  X
} from 'lucide-react';

export const DocumentManagement: React.FC = () => {
  const { documents, addDocument, deleteDocument } = useSchool();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Upload Form
  const [docForm, setDocForm] = useState({
    title: '',
    category: 'Curriculum & Syllabi' as SchoolDocument['category'],
    fileType: 'PDF' as const,
    fileSize: '2.4 MB',
    accessRole: 'All' as SchoolDocument['accessRole']
  });

  const categories = [
    'All Categories',
    'Curriculum & Syllabi',
    'School Policies & Handbooks',
    'Student Records & Medicals',
    'Financial Audits',
    'Administrative Forms'
  ];

  const filteredDocs = documents.filter((d) => {
    const matchesCategory =
      selectedCategory === 'all' || selectedCategory === 'All Categories' || d.category === selectedCategory;
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDocument({
      title: docForm.title,
      category: docForm.category,
      fileType: docForm.fileType,
      fileSize: docForm.fileSize,
      fileUrl: '#',
      uploadedBy: 'Principal Registrar',
      accessRole: docForm.accessRole
    });
    setIsUploadModalOpen(false);
    setDocForm({
      title: '',
      category: 'Curriculum & Syllabi',
      fileType: 'PDF',
      fileSize: '2.4 MB',
      accessRole: 'All'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">Document Management Vault</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              AES-256 Encrypted
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Securely store, organize, and access school curriculum handbooks, policies, and official records.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <UploadCloud className="w-4 h-4 text-amber-300" />
          Upload Document
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
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

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded">
                    {doc.accessRole}
                  </span>
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                    title="Delete file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-sm text-slate-900 mt-3">{doc.title}</h3>
              <span className="text-[11px] text-emerald-700 font-semibold block">{doc.category}</span>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono">{doc.fileSize} • {doc.fileType}</span>
                <span className="text-[11px] font-mono">{doc.uploadDate}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <a
                href={doc.fileUrl}
                onClick={(e) => {
                  e.preventDefault();
                  alert(`Downloading file: "${doc.title}"...`);
                }}
                className="w-full py-2 bg-slate-50 hover:bg-emerald-50 text-emerald-800 hover:text-emerald-900 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 hover:border-emerald-200 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download Document
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base font-['Outfit']">Upload Secure Document</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-white">✕</button>
            </div>
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  placeholder="e.g. 2026 Academic Calendar & Term Dates"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={docForm.category}
                  onChange={(e) => setDocForm({ ...docForm, category: e.target.value as SchoolDocument['category'] })}
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
                <label className="block font-semibold text-slate-700 mb-1">Access Authorization</label>
                <select
                  value={docForm.accessRole}
                  onChange={(e) => setDocForm({ ...docForm, accessRole: e.target.value as SchoolDocument['accessRole'] })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                >
                  <option value="All">All Users (Public)</option>
                  <option value="Staff Only">Teaching & Support Faculty Only</option>
                  <option value="Admin Only">Executive Administration Only (Encrypted)</option>
                </select>
              </div>

              {/* Drag and Drop Box */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                <UploadCloud className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
                <p className="font-bold text-slate-700">Drag & Drop files here, or click to browse</p>
                <span className="text-[11px] text-slate-400">Supported formats: PDF, DOCX, XLSX up to 50MB</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl"
                >
                  Store Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
