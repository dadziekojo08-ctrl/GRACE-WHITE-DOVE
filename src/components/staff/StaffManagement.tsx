import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { StaffMember } from '../../types';
import {
  Briefcase,
  UserPlus,
  Search,
  Phone,
  Mail,
  Edit2,
  Calendar,
  CheckCircle,
  Download,
  Printer,
  Trash2,
  X,
  Eye,
  Award,
  DollarSign,
  GraduationCap,
  ShieldCheck,
  Building2,
  Filter,
  Grid,
  List,
  UserCheck,
  Clock,
  QrCode,
  Sparkles,
  RefreshCw,
  Camera
} from 'lucide-react';
import { StaffPhotoUploader } from '../common/StaffPhotoUploader';

export const StaffManagement: React.FC = () => {
  const { staff, addStaff, updateStaff, deleteStaff, academicYear } = useSchool();

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [viewingStaff, setViewingStaff] = useState<StaffMember | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<StaffMember | null>(null);

  // Form State
  const initialFormState = {
    name: '',
    staffCode: '',
    email: '',
    phone: '',
    role: 'Teacher' as StaffMember['role'],
    department: 'Science & Mathematics',
    designation: '',
    qualification: '',
    basicSalary: 0,
    status: 'Active' as StaffMember['status'],
    photoUrl: ''
  };

  const [form, setForm] = useState(initialFormState);

  const departments = [
    'All Departments',
    'Science & Mathematics',
    'Languages & Humanities',
    'Administration & Registry',
    'Accounts & Bursary',
    'Library & Resource Centre',
    'Logistics & Fleet',
    'Physical Education & Sports',
    'Early Childhood Education'
  ];

  const roles = ['All Roles', 'Teacher', 'Admin', 'Accountant', 'Librarian', 'Transport'];

  // Metrics
  const totalStaffCount = staff.length;
  const teachingStaffCount = staff.filter((s) => s.role === 'Teacher').length;
  const adminAccountsCount = staff.filter((s) => s.role === 'Admin' || s.role === 'Accountant').length;
  const supportLogisticsCount = staff.filter((s) => s.role === 'Librarian' || s.role === 'Transport' || (s.role as string) === 'Driver').length;
  const totalMonthlyPayroll = staff.reduce((sum, s) => sum + (s.basicSalary || 0), 0);

  // Filtered List
  const generateStaffId = (role: StaffMember['role']) => {
    const prefix = role === 'Teacher' ? 'TEA' : role === 'Admin' ? 'ADM' : role === 'Accountant' ? 'ACC' : role === 'Librarian' ? 'LIB' : 'TRN';
    return `STF-${prefix}-${Math.floor(100 + Math.random() * 900)}`;
  };

  const filteredStaff = useMemo(() => {
    return staff.filter((stf) => {
      const matchSearch =
        stf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stf.staffCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stf.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stf.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stf.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stf.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDept = selectedDept === 'all' || selectedDept === 'All Departments' || stf.department === selectedDept;
      const matchRole = selectedRole === 'all' || selectedRole === 'All Roles' || stf.role === selectedRole;
      const matchStatus = selectedStatus === 'all' || stf.status === selectedStatus;

      return matchSearch && matchDept && matchRole && matchStatus;
    });
  }, [staff, searchTerm, selectedDept, selectedRole, selectedStatus]);

  // Handlers
  const handleOpenAddModal = () => {
    const defaultCode = generateStaffId('Teacher');
    setForm({
      ...initialFormState,
      role: 'Teacher',
      staffCode: defaultCode,
      photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent('Staff-' + Date.now())}`
    });
    setIsAddModalOpen(true);
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      alert('Please fill in the required fields (Name, Email, Phone).');
      return;
    }

    addStaff({
      name: form.name.trim(),
      staffCode: form.staffCode || generateStaffId(form.role),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: form.role,
      department: form.department,
      designation: form.designation || 'Staff Member',
      qualification: form.qualification || 'Higher Education Certificate',
      basicSalary: Number(form.basicSalary) || 2500,
      status: form.status,
      photoUrl: form.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(form.name)}`
    });

    setIsAddModalOpen(false);
    alert(`Staff member ${form.name} registered successfully with ID ${form.staffCode || 'generated'}!`);
  };

  const handleOpenEdit = (stf: StaffMember) => {
    setEditingStaff(stf);
    setForm({
      name: stf.name,
      staffCode: stf.staffCode,
      email: stf.email,
      phone: stf.phone,
      role: stf.role,
      department: stf.department,
      designation: stf.designation,
      qualification: stf.qualification,
      basicSalary: stf.basicSalary,
      status: stf.status,
      photoUrl: stf.photoUrl || stf.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(stf.name)}`
    });
  };

  const handleUpdateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    updateStaff(editingStaff.id, {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: form.role,
      department: form.department,
      designation: form.designation,
      qualification: form.qualification,
      basicSalary: Number(form.basicSalary),
      status: form.status,
      photoUrl: form.photoUrl
    });

    setEditingStaff(null);
    alert(`Staff records for ${form.name} updated successfully!`);
  };

  const handleDeleteStaff = (stf: StaffMember) => {
    deleteStaff(stf.id);
    setDeleteCandidate(null);
    alert(`Staff record for ${stf.name} has been removed.`);
  };

  const handleExportCSV = () => {
    let csv = `Grace White Dove School Complex - Staff Directory Export\n`;
    csv += `Academic Session,${academicYear}\n`;
    csv += `Export Date,${new Date().toLocaleDateString()}\n\n`;
    csv += `Staff Code,Full Name,Role,Department,Designation,Qualification,Phone,Email,Base Salary (GHS),Status\n`;

    filteredStaff.forEach((s) => {
      csv += `"${s.staffCode}","${s.name}","${s.role}","${s.department}","${s.designation}","${s.qualification}","${s.phone}","${s.email}",${s.basicSalary},"${s.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GraceWhiteDove_Staff_Directory_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner & Control Deck */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5 text-emerald-800" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">Staff Management Portal</h2>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {staff.length} Total Personnel
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Comprehensive directory for academic faculty, administration, bursary officers, drivers, and support personnel.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Print Register
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-amber-300" />
            Add Staff Member
          </button>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Teaching Faculty</span>
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-['Outfit']">{teachingStaffCount}</span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Active</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Class & Subject Teachers</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Admin & Accounts</span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-['Outfit']">{adminAccountsCount}</span>
            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">Executive</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Head of School & Bursary</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Logistics & Support</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-['Outfit']">{supportLogisticsCount}</span>
            <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">Operations</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Librarians & Transport Drivers</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Base Salary Pool</span>
            <DollarSign className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black text-emerald-950 font-['Outfit']">
              GHS {totalMonthlyPayroll.toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Monthly base staff payroll commitment</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search staff by name, code (STF-...), designation, department, email or phone..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white text-slate-900"
            />
          </div>

          {/* Department Filter */}
          <div className="w-full md:w-56">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              {departments.map((d) => (
                <option key={d} value={d === 'All Departments' ? 'all' : d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div className="w-full md:w-40">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              {roles.map((r) => (
                <option key={r} value={r === 'All Roles' ? 'all' : r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-36">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Terminated">Terminated / Inactive</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-emerald-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Card Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-emerald-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Filters Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div>
            Showing <strong className="text-slate-900">{filteredStaff.length}</strong> of{' '}
            <strong className="text-slate-900">{staff.length}</strong> staff members
          </div>
          {(searchTerm || selectedDept !== 'all' || selectedRole !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDept('all');
                setSelectedRole('all');
                setSelectedStatus('all');
              }}
              className="text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Staff Display Section */}
      {filteredStaff.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No staff members found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or register a new staff member.</p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-amber-300" /> Add Staff Member
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((stf) => (
            <div
              key={stf.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={stf.photoUrl || stf.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(stf.name)}`}
                      alt={stf.name}
                      className="w-13 h-13 rounded-xl object-cover ring-2 ring-emerald-600/20 bg-slate-100 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-tight">{stf.name}</h3>
                      <p className="text-xs text-emerald-800 font-semibold mt-0.5">{stf.designation}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                          {stf.staffCode}
                        </span>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded">
                          {stf.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      stf.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : stf.status === 'On Leave'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {stf.status}
                  </span>
                </div>

                {/* Details */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium truncate">{stf.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate text-slate-500">{stf.qualification}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <a href={`tel:${stf.phone}`} className="font-mono hover:underline text-slate-800">
                      {stf.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <a href={`mailto:${stf.email}`} className="truncate hover:underline text-slate-800">
                      {stf.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Deck */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-400 text-[10px] block">Base Salary</span>
                  <span className="font-bold text-slate-900 font-mono">GHS {stf.basicSalary.toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setViewingStaff(stf)}
                    className="p-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-900 rounded-lg transition-colors cursor-pointer"
                    title="View Staff ID Card & Full Profile"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(stf)}
                    className="p-1.5 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-900 rounded-lg transition-colors cursor-pointer"
                    title="Edit Staff Member"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteCandidate(stf)}
                    className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                    title="Remove Staff"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Full Data Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Staff Member</th>
                  <th className="py-3.5 px-4">Staff Code</th>
                  <th className="py-3.5 px-4">Role & Dept</th>
                  <th className="py-3.5 px-4">Qualification</th>
                  <th className="py-3.5 px-4">Contact (Phone/Email)</th>
                  <th className="py-3.5 px-4">Base Salary</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((stf) => (
                  <tr key={stf.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={stf.photoUrl || stf.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(stf.name)}`}
                          alt={stf.name}
                          className="w-9 h-9 rounded-lg object-cover bg-slate-100 ring-1 ring-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{stf.name}</div>
                          <div className="text-[11px] text-emerald-800 font-semibold">{stf.designation}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{stf.staffCode}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{stf.department}</div>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded">
                        {stf.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{stf.qualification}</td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div>{stf.phone}</div>
                      <div className="text-slate-400 font-sans text-[10px]">{stf.email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">GHS {stf.basicSalary.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          stf.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : stf.status === 'On Leave'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {stf.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingStaff(stf)}
                          className="p-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-900 rounded-lg cursor-pointer"
                          title="View Profile & ID Card"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(stf)}
                          className="p-1.5 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-900 rounded-lg cursor-pointer"
                          title="Edit Staff"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(stf)}
                          className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-700 rounded-lg cursor-pointer"
                          title="Delete Staff"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base font-['Outfit']">Enroll New Staff Member</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white hover:text-amber-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-6 space-y-4 text-xs">
              {/* Staff Photo & Profile Picture Studio */}
              <div>
                <StaffPhotoUploader
                  value={form.photoUrl}
                  onChange={(url) => setForm({ ...form, photoUrl: url })}
                  name={form.name || 'Staff Member'}
                  role={form.role}
                  size="md"
                  label="Staff Identification & Profile Photo"
                  helperText="Upload official staff portrait, capture via camera, or choose an avatar badge."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Full Name (with title) *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-700"
                    placeholder="e.g. Mr. Samuel Boateng / Dr. Mary Mensah"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">Staff ID Code</label>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-600" /> Auto
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={form.staffCode}
                      className="w-full border border-slate-300 rounded-lg pl-3 pr-8 py-2 font-mono font-bold text-emerald-950 bg-slate-100/80 focus:outline-none cursor-default"
                      placeholder="STF-TEA-01"
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, staffCode: generateStaffId(form.role) })}
                      title="Generate New Unique Staff ID"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-800 p-1 cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-700"
                    placeholder="staff@gracewhitedove.edu.gh"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-700"
                    placeholder="+233 24 000 0000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">System Portal Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => {
                      const newRole = e.target.value as StaffMember['role'];
                      const newCode = generateStaffId(newRole);
                      setForm({ ...form, role: newRole, staffCode: newCode });
                    }}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold"
                  >
                    <option value="Teacher">Teacher (Academic Faculty)</option>
                    <option value="Admin">Admin (Head of School / Registrar)</option>
                    <option value="Accountant">Accountant (Bursary & Billing)</option>
                    <option value="Librarian">Librarian (Resource Center)</option>
                    <option value="Transport">Transport (Fleet & Driver)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold"
                  >
                    {departments
                      .filter((d) => d !== 'All Departments')
                      .map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation / Title</label>
                  <input
                    type="text"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                    placeholder="e.g. Senior Mathematics Teacher"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                    placeholder="e.g. B.Ed (UCC) / M.Sc"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Base Salary (GHS) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={form.basicSalary}
                    onChange={(e) => setForm({ ...form, basicSalary: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employment Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as StaffMember['status'] })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Terminated">Terminated / Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Save & Register Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="bg-amber-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-200" />
                <h3 className="font-bold text-base font-['Outfit']">Edit Staff Profile: {editingStaff.name}</h3>
              </div>
              <button onClick={() => setEditingStaff(null)} className="text-white hover:text-amber-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStaff} className="p-6 space-y-4 text-xs">
              {/* Staff Photo & Profile Picture Studio */}
              <div>
                <StaffPhotoUploader
                  value={form.photoUrl}
                  onChange={(url) => setForm({ ...form, photoUrl: url })}
                  name={form.name || editingStaff.name}
                  role={form.role}
                  size="md"
                  label="Update Staff Identification & Profile Photo"
                  helperText="Change or update staff photo (drag & drop, live webcam capture, or pick portrait presets)."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Staff Code</label>
                  <input
                    type="text"
                    disabled
                    value={form.staffCode}
                    className="w-full border border-slate-200 bg-slate-100 rounded-lg px-3 py-2 font-mono text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">System Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as StaffMember['role'] })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold"
                  >
                    <option value="Teacher">Teacher</option>
                    <option value="Admin">Admin</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Librarian">Librarian</option>
                    <option value="Transport">Transport</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold"
                  >
                    {departments
                      .filter((d) => d !== 'All Departments')
                      .map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Base Salary (GHS)</label>
                  <input
                    type="number"
                    value={form.basicSalary}
                    onChange={(e) => setForm({ ...form, basicSalary: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as StaffMember['status'] })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Terminated">Terminated / Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff ID Card & Full Profile Modal */}
      {viewingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="bg-emerald-950 text-white p-4 flex items-center justify-between border-b border-emerald-800">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm font-['Outfit']">Official Staff Identification Badge</h3>
              </div>
              <button onClick={() => setViewingStaff(null)} className="text-white hover:text-amber-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* ID Badge Card */}
              <div className="border-2 border-emerald-900 rounded-2xl p-5 bg-gradient-to-b from-emerald-50/50 via-white to-amber-50/30 relative overflow-hidden shadow-md">
                <div className="absolute top-0 right-0 left-0 h-3 bg-gradient-to-r from-emerald-800 via-amber-400 to-emerald-900" />

                {/* School Header */}
                <div className="text-center pt-2 pb-3 border-b border-emerald-900/20">
                  <h4 className="font-extrabold text-xs text-emerald-950 uppercase tracking-wider font-['Outfit']">
                    Grace White Dove School Complex
                  </h4>
                  <p className="text-[9px] text-slate-500 font-medium">Excellence, Discipline & Christian Integrity</p>
                  <span className="inline-block mt-1 bg-emerald-900 text-white text-[9px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-widest">
                    STAFF IDENTITY CARD
                  </span>
                </div>

                {/* Photo & Core Info */}
                <div className="mt-4 flex items-center gap-4">
                  <div className="relative group">
                    <img
                      src={viewingStaff.photoUrl || viewingStaff.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(viewingStaff.name)}`}
                      alt={viewingStaff.name}
                      className="w-20 h-20 rounded-xl object-cover ring-2 ring-emerald-800 bg-white shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const target = viewingStaff;
                        setViewingStaff(null);
                        handleOpenEdit(target);
                      }}
                      title="Update staff picture"
                      className="absolute -bottom-1 -right-1 bg-emerald-800 hover:bg-emerald-900 text-white p-1 rounded-full shadow-md border border-white transition-transform hover:scale-110"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-extrabold text-sm text-slate-900">{viewingStaff.name}</h5>
                    <p className="text-xs font-bold text-emerald-800">{viewingStaff.designation}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">{viewingStaff.department}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="font-mono text-xs font-black bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded">
                        {viewingStaff.staffCode}
                      </span>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                        {viewingStaff.role}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const target = viewingStaff;
                          setViewingStaff(null);
                          handleOpenEdit(target);
                        }}
                        className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline inline-flex items-center gap-0.5 cursor-pointer ml-auto"
                      >
                        <Edit2 className="w-2.5 h-2.5" /> Change Photo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] bg-white/80 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block font-semibold">QUALIFICATION</span>
                    <span className="font-bold text-slate-800 truncate block">{viewingStaff.qualification}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">JOINED DATE</span>
                    <span className="font-bold text-slate-800">{viewingStaff.joinedDate || '2024-09-01'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">PHONE</span>
                    <span className="font-bold text-slate-800 font-mono">{viewingStaff.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">STATUS</span>
                    <span className="font-bold text-emerald-800">{viewingStaff.status}</span>
                  </div>
                </div>

                {/* Verification Barcode footer */}
                <div className="mt-4 pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                  <span>VALID ACADEMIC YEAR: {academicYear}</span>
                  <span className="font-bold text-emerald-900">GWSC-AUTHORIZED</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    handleOpenEdit(viewingStaff);
                    setViewingStaff(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Record
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-300" /> Print Staff Badge
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Candidate Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-200 p-5 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-base text-slate-900 font-['Outfit']">Remove Staff Record?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <strong>{deleteCandidate.name}</strong> ({deleteCandidate.staffCode}) from the staff registry?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStaff(deleteCandidate)}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
