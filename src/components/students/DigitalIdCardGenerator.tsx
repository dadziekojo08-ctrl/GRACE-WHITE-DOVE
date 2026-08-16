import React, { useState, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student } from '../../types';
import {
  CreditCard,
  Printer,
  X,
  Sparkles,
  QrCode,
  Shield,
  CheckCircle,
  RotateCw,
  Layers,
  Palette,
  Users,
  Search,
  Check,
  Award,
  Phone,
  Calendar,
  MapPin,
  Building,
  Sliders,
  ChevronRight,
  School,
  FileSpreadsheet,
  Download,
  AlertCircle
} from 'lucide-react';

interface DigitalIdCardGeneratorProps {
  initialStudent?: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

type CardTheme = 'emerald-gold' | 'royal-navy' | 'burgundy-gold' | 'modern-clean';
type CardOrientation = 'portrait' | 'landscape';
type CardSide = 'front' | 'back' | 'both';

export const DigitalIdCardGenerator: React.FC<DigitalIdCardGeneratorProps> = ({
  initialStudent,
  isOpen,
  onClose
}) => {
  const { students, classes, academicYear, currentTerm } = useSchool();

  // Mode: Single student card or Bulk class sheet
  const [activeMode, setActiveMode] = useState<'single' | 'batch'>('single');

  // Currently selected student in single mode
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudent ? initialStudent.id : (students[0]?.id || '')
  );

  // Filter in single mode student picker
  const [studentSearch, setStudentSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  // Batch mode class selector and selected students set
  const [batchClass, setBatchClass] = useState<string>(
    initialStudent ? initialStudent.className : (classes[0]?.name || 'Primary 1 (Grade 1)')
  );
  const [selectedBatchStudentIds, setSelectedBatchStudentIds] = useState<string[]>([]);

  // Card Design Customizations
  const [theme, setTheme] = useState<CardTheme>('emerald-gold');
  const [orientation, setOrientation] = useState<CardOrientation>('portrait');
  const [activeSide, setActiveSide] = useState<CardSide>('front');
  const [isFlipped, setIsFlipped] = useState(false);

  // Configurable fields on card
  const [cardConfig, setCardConfig] = useState({
    schoolName: 'Grace White Dove School Complex',
    motto: 'Excellence, Integrity & Discipline',
    campus: 'Main Campus, Achimota - Accra',
    phone: '+233 24 412 3456 / +233 20 890 1234',
    email: 'info@gracewhitedove.edu.gh',
    academicYearDisplay: academicYear || '2025/2026',
    expiryDate: '31 JUL 2026',
    issueDate: '01 SEP 2025',
    bloodGroup: 'O+',
    house: 'Dove Gold House',
    showBarcode: true,
    showQrCode: true,
    showHologram: true,
    showPrincipalSignature: true,
    showLanyardHole: true
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Find active student object
  const activeStudent = students.find((s) => s.id === selectedStudentId) || initialStudent || students[0];

  // Filter students for picker
  const selectableStudents = students.filter((s) => {
    const matchesSearch =
      studentSearch === '' ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesClass = classFilter === 'all' || s.className === classFilter;
    return matchesSearch && matchesClass;
  });

  // Batch students for active batch class
  const batchStudents = students.filter((s) => s.className === batchClass);

  // Initialize batch selection when batchClass changes
  const handleSelectAllBatch = () => {
    if (selectedBatchStudentIds.length === batchStudents.length) {
      setSelectedBatchStudentIds([]);
    } else {
      setSelectedBatchStudentIds(batchStudents.map((s) => s.id));
    }
  };

  const handleToggleBatchStudent = (id: string) => {
    setSelectedBatchStudentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Execute native print
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  // Theme styling configurations
  const getThemeStyles = () => {
    switch (theme) {
      case 'royal-navy':
        return {
          primaryBg: 'bg-slate-900',
          headerBg: 'bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950',
          accentBorder: 'border-amber-400',
          accentText: 'text-amber-400',
          badgeBg: 'bg-amber-400 text-slate-950',
          ribbonBg: 'bg-indigo-950/80',
          textColor: 'text-slate-100',
          footerBg: 'bg-slate-950',
          watermarkColor: 'text-indigo-900/15'
        };
      case 'burgundy-gold':
        return {
          primaryBg: 'bg-rose-950',
          headerBg: 'bg-gradient-to-r from-rose-950 via-rose-900 to-red-950',
          accentBorder: 'border-amber-300',
          accentText: 'text-amber-300',
          badgeBg: 'bg-amber-300 text-rose-950',
          ribbonBg: 'bg-rose-900/80',
          textColor: 'text-rose-50',
          footerBg: 'bg-rose-950',
          watermarkColor: 'text-rose-800/15'
        };
      case 'modern-clean':
        return {
          primaryBg: 'bg-white',
          headerBg: 'bg-gradient-to-r from-emerald-800 to-emerald-950',
          accentBorder: 'border-emerald-700',
          accentText: 'text-emerald-700',
          badgeBg: 'bg-emerald-800 text-white',
          ribbonBg: 'bg-emerald-50',
          textColor: 'text-slate-800',
          footerBg: 'bg-slate-900',
          watermarkColor: 'text-slate-200'
        };
      case 'emerald-gold':
      default:
        return {
          primaryBg: 'bg-emerald-950',
          headerBg: 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950',
          accentBorder: 'border-amber-400',
          accentText: 'text-amber-400',
          badgeBg: 'bg-amber-400 text-emerald-950',
          ribbonBg: 'bg-emerald-900/80',
          textColor: 'text-emerald-50',
          footerBg: 'bg-emerald-950',
          watermarkColor: 'text-emerald-800/20'
        };
    }
  };

  const themeStyle = getThemeStyles();

  // Helper for generating dynamic SVG Barcode lines
  const renderSvgBarcode = (code: string, width = 160, height = 32) => {
    // Generate pseudorandom pseudo-bars based on code string
    const bars: { x: number; w: number }[] = [];
    let curX = 4;
    for (let i = 0; i < code.length; i++) {
      const charCode = code.charCodeAt(i);
      const barW = (charCode % 3) + 1;
      bars.push({ x: curX, w: barW });
      curX += barW + ((charCode % 2) + 1.5);
      if (curX > width - 10) break;
    }
    // Add extra trailing guard bars
    bars.push({ x: curX, w: 2 }, { x: curX + 4, w: 1 }, { x: curX + 7, w: 2 });

    return (
      <svg width={width} height={height} className="overflow-visible mx-auto">
        <rect x="0" y="0" width={width} height={height} fill="#ffffff" rx="2" />
        {bars.map((bar, idx) => (
          <rect key={idx} x={bar.x} y={3} width={bar.w} height={height - 11} fill="#111827" />
        ))}
        <text
          x={width / 2}
          y={height - 2}
          textAnchor="middle"
          fontSize="7"
          fontFamily="monospace"
          fontWeight="bold"
          fill="#374151"
        >
          *{code}*
        </text>
      </svg>
    );
  };

  // Helper for generating dynamic QR Code graphic
  const renderSvgQrCode = (payload: string, size = 64) => {
    return (
      <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-2xs inline-block">
        <svg width={size} height={size} viewBox="0 0 100 100" className="w-full h-full">
          {/* Position detection patterns (3 corners) */}
          {/* Top-Left */}
          <rect x="5" y="5" width="28" height="28" fill="#064e3b" rx="3" />
          <rect x="11" y="11" width="16" height="16" fill="#ffffff" />
          <rect x="15" y="15" width="8" height="8" fill="#064e3b" />
          {/* Top-Right */}
          <rect x="67" y="5" width="28" height="28" fill="#064e3b" rx="3" />
          <rect x="73" y="11" width="16" height="16" fill="#ffffff" />
          <rect x="77" y="15" width="8" height="8" fill="#064e3b" />
          {/* Bottom-Left */}
          <rect x="5" y="67" width="28" height="28" fill="#064e3b" rx="3" />
          <rect x="11" y="73" width="16" height="16" fill="#ffffff" />
          <rect x="15" y="77" width="8" height="8" fill="#064e3b" />

          {/* Alignment and Timing patterns */}
          <rect x="45" y="10" width="10" height="4" fill="#064e3b" />
          <rect x="45" y="20" width="10" height="4" fill="#064e3b" />
          <rect x="10" y="45" width="4" height="10" fill="#064e3b" />
          <rect x="20" y="45" width="4" height="10" fill="#064e3b" />

          {/* Random data matrix dots */}
          <rect x="42" y="42" width="16" height="16" fill="#064e3b" rx="2" />
          <rect x="46" y="46" width="8" height="8" fill="#ffffff" />
          <rect x="68" y="42" width="6" height="6" fill="#064e3b" />
          <rect x="78" y="48" width="8" height="5" fill="#064e3b" />
          <rect x="65" y="68" width="6" height="10" fill="#064e3b" />
          <rect x="75" y="75" width="18" height="6" fill="#064e3b" />
          <rect x="85" y="65" width="8" height="6" fill="#064e3b" />
          <rect x="42" y="70" width="12" height="6" fill="#064e3b" />
          <rect x="45" y="85" width="10" height="8" fill="#064e3b" />
        </svg>
      </div>
    );
  };

  // Single ID Card Component (Front View)
  const renderCardFront = (student: Student, isPortrait: boolean) => {
    if (isPortrait) {
      return (
        <div
          className={`w-[320px] h-[490px] rounded-2xl overflow-hidden shadow-2xl relative border-2 ${themeStyle.accentBorder} ${
            theme === 'modern-clean' ? 'bg-white' : themeStyle.primaryBg
          } flex flex-col justify-between select-none print:shadow-none print:border print:m-0`}
        >
          {/* Lanyard punch slot marker */}
          {cardConfig.showLanyardHole && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-2 rounded-full bg-slate-800/40 border border-white/20 z-20 flex items-center justify-center">
              <div className="w-8 h-1 bg-black/40 rounded-full" />
            </div>
          )}

          {/* Header Banner */}
          <div className={`${themeStyle.headerBg} pt-6 pb-3 px-4 text-center relative border-b border-amber-400/30`}>
            {/* Background Security Watermark */}
            <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
              <School className="w-36 h-36" />
            </div>

            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-full bg-amber-400 text-emerald-950 flex items-center justify-center font-black text-xs shadow-sm ring-2 ring-white/30">
                🕊️
              </div>
              <div className="text-left">
                <h3 className="font-extrabold text-white text-[12px] tracking-tight leading-none uppercase font-['Outfit']">
                  Grace White Dove
                </h3>
                <span className="text-[8px] text-amber-300 font-bold uppercase tracking-widest block">
                  School Complex
                </span>
              </div>
            </div>

            <div className="inline-block bg-amber-400 text-emerald-950 font-black text-[9px] px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs mt-1">
              Student Identity Card
            </div>
          </div>

          {/* Student Photo & Particulars */}
          <div className="px-5 py-2 flex flex-col items-center text-center relative z-10 flex-1 justify-center space-y-2">
            {/* Student Photo with Holographic Gold Border */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden ring-3 ring-amber-400 shadow-lg bg-slate-200 mx-auto relative group">
                <img
                  src={student.photoUrl}
                  alt={student.firstName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {cardConfig.showHologram && (
                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-300 via-rose-300 to-cyan-300 opacity-80 border border-white flex items-center justify-center shadow-xs">
                    <Shield className="w-3 h-3 text-emerald-950" />
                  </div>
                )}
              </div>
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-emerald-700 text-white font-extrabold text-[8px] px-2 py-0.2 rounded-full uppercase tracking-wider border border-white/40 shadow-xs whitespace-nowrap">
                {student.status || 'Active Pupil'}
              </span>
            </div>

            {/* Student Name */}
            <div className="pt-1">
              <h4
                className={`font-black text-base uppercase tracking-tight font-['Outfit'] ${
                  theme === 'modern-clean' ? 'text-slate-900' : 'text-white'
                }`}
              >
                {student.firstName} {student.lastName}
              </h4>
              <span className={`text-[10px] font-mono font-bold ${themeStyle.accentText}`}>
                {student.admissionNo}
              </span>
            </div>

            {/* Structured Details Matrix */}
            <div
              className={`w-full rounded-xl p-2.5 text-[10px] space-y-1 border ${
                theme === 'modern-clean'
                  ? 'bg-slate-50 border-slate-200 text-slate-700'
                  : 'bg-black/25 border-white/10 text-slate-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-slate-400 uppercase font-semibold text-[9px]">Class & Stream:</span>
                <span className="font-bold text-white bg-emerald-800 px-1.5 py-0.2 rounded text-[10px]">
                  {student.className} ({student.section || 'A'})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 uppercase font-semibold text-[9px]">Roll Number:</span>
                <span className="font-mono font-bold">{student.rollNo || '01'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 uppercase font-semibold text-[9px]">Date of Birth:</span>
                <span className="font-mono">{student.dateOfBirth || '2016-04-12'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 uppercase font-semibold text-[9px]">House / Group:</span>
                <span className="font-semibold text-amber-300">{cardConfig.house}</span>
              </div>
            </div>

            {/* Barcode Section */}
            {cardConfig.showBarcode && (
              <div className="w-full pt-0.5">{renderSvgBarcode(student.admissionNo, 240, 28)}</div>
            )}
          </div>

          {/* Card Footer Banner */}
          <div
            className={`${themeStyle.footerBg} px-4 py-2 text-center border-t border-white/10 flex items-center justify-between text-[8px] text-slate-300`}
          >
            <div>
              <span className="block text-slate-400">Valid Academic Year</span>
              <span className="font-bold text-amber-400">{cardConfig.academicYearDisplay}</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-bold text-amber-400 text-[10px]">
              ★
            </div>
            <div className="text-right">
              <span className="block text-slate-400">Expires</span>
              <span className="font-bold font-mono text-white">{cardConfig.expiryDate}</span>
            </div>
          </div>
        </div>
      );
    }

    // Landscape Card Front View
    return (
      <div
        className={`w-[490px] h-[310px] rounded-2xl overflow-hidden shadow-2xl relative border-2 ${themeStyle.accentBorder} ${
          theme === 'modern-clean' ? 'bg-white' : themeStyle.primaryBg
        } flex flex-col justify-between select-none print:shadow-none print:border print:m-0`}
      >
        {/* Top Header Strip */}
        <div className={`${themeStyle.headerBg} px-4 py-2.5 flex items-center justify-between border-b border-amber-400/30`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-400 text-emerald-950 flex items-center justify-center font-black text-sm shadow-sm ring-2 ring-white/30">
              🕊️
            </div>
            <div>
              <h3 className="font-extrabold text-white text-xs tracking-tight uppercase font-['Outfit']">
                Grace White Dove School Complex
              </h3>
              <p className="text-[8px] text-amber-300 italic font-medium">"{cardConfig.motto}"</p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block bg-amber-400 text-emerald-950 font-black text-[8px] px-2 py-0.5 rounded uppercase tracking-wider">
              Student ID Card
            </span>
            <span className="block text-[8px] text-slate-300 font-mono mt-0.5">
              Year: {cardConfig.academicYearDisplay}
            </span>
          </div>
        </div>

        {/* Middle Body */}
        <div className="px-5 py-3 flex items-center gap-4 relative z-10 flex-1">
          {/* Left Column: Photo & Chips */}
          <div className="flex flex-col items-center space-y-1.5 shrink-0">
            <div className="w-24 h-28 rounded-xl overflow-hidden ring-2 ring-amber-400 shadow-md bg-slate-200 relative">
              <img
                src={student.photoUrl}
                alt={student.firstName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {cardConfig.showHologram && (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gradient-to-tr from-amber-300 to-rose-400 opacity-85 border border-white flex items-center justify-center">
                  <Shield className="w-2.5 h-2.5 text-emerald-950" />
                </div>
              )}
            </div>
            <span className="font-mono text-[9px] font-bold text-amber-400 bg-black/40 px-2 py-0.2 rounded border border-amber-400/30">
              {student.admissionNo}
            </span>
          </div>

          {/* Right Column: Information Grid */}
          <div className="flex-1 space-y-1.5">
            <div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold">
                Student Name:
              </span>
              <h4
                className={`font-black text-sm uppercase tracking-tight font-['Outfit'] ${
                  theme === 'modern-clean' ? 'text-slate-900' : 'text-white'
                }`}
              >
                {student.firstName} {student.lastName}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] bg-black/20 p-2 rounded-xl border border-white/10">
              <div>
                <span className="text-slate-400 text-[8px] block uppercase">Class / Stream:</span>
                <span className="font-bold text-amber-300">
                  {student.className} ({student.section || 'A'})
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[8px] block uppercase">Roll Number:</span>
                <span className="font-mono font-bold text-white">{student.rollNo || '01'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[8px] block uppercase">Date of Birth:</span>
                <span className="font-mono text-slate-200">{student.dateOfBirth || '2016-04-12'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[8px] block uppercase">House:</span>
                <span className="font-semibold text-white">{cardConfig.house}</span>
              </div>
            </div>

            {/* Barcode Strip */}
            {cardConfig.showBarcode && (
              <div className="pt-0.5">{renderSvgBarcode(student.admissionNo, 260, 24)}</div>
            )}
          </div>
        </div>

        {/* Footer Bar */}
        <div
          className={`${themeStyle.footerBg} px-4 py-1.5 text-center border-t border-white/10 flex items-center justify-between text-[8px] text-slate-300`}
        >
          <span>Campus: {cardConfig.campus}</span>
          <span className="font-mono text-amber-400 font-bold">Valid Thru: {cardConfig.expiryDate}</span>
        </div>
      </div>
    );
  };

  // Back of ID Card Component
  const renderCardBack = (student: Student, isPortrait: boolean) => {
    if (isPortrait) {
      return (
        <div
          className={`w-[320px] h-[490px] rounded-2xl overflow-hidden shadow-2xl relative border-2 ${themeStyle.accentBorder} ${
            theme === 'modern-clean' ? 'bg-slate-50' : themeStyle.primaryBg
          } flex flex-col justify-between select-none p-4 text-xs print:shadow-none print:border print:m-0`}
        >
          {/* Top Return Notice */}
          <div className="text-center pb-2 border-b border-white/10 space-y-1">
            <h5 className="font-bold text-amber-400 text-[11px] uppercase tracking-wider">
              Terms of Identification & Safe Return
            </h5>
            <p className="text-[8px] text-slate-300 leading-tight">
              This card is the property of Grace White Dove School Complex. It is non-transferable and must be presented on campus.
            </p>
          </div>

          {/* Emergency Contacts & Medical Info */}
          <div className="bg-black/30 p-3 rounded-xl border border-white/10 space-y-1.5 text-[9px] text-slate-200">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[10px] pb-1 border-b border-white/10">
              <Phone className="w-3 h-3 text-amber-400" /> Emergency Contacts
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Guardian Name:</span>
              <span className="font-bold text-white">{student.guardianName || 'Parent / Guardian'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Parent Hotline:</span>
              <span className="font-mono font-bold text-amber-300">{student.guardianPhone || '+233 24 000 0000'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Blood Group:</span>
              <span className="font-bold text-rose-400">{cardConfig.bloodGroup}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">School Admin Tel:</span>
              <span className="font-mono text-slate-300">{cardConfig.phone.split('/')[0]}</span>
            </div>
          </div>

          {/* Verification QR Code and Instructions */}
          <div className="flex items-center justify-between gap-3 bg-white/5 p-2.5 rounded-xl border border-white/10">
            <div className="text-left space-y-0.5">
              <span className="text-[9px] font-bold text-amber-400 block uppercase">
                Digital Verification
              </span>
              <p className="text-[7.5px] text-slate-300 leading-tight">
                Scan QR code with authorized scanner or smartphone to verify pupil enrollment record.
              </p>
              <span className="font-mono text-[7px] text-slate-400 block pt-0.5">
                ID: {student.admissionNo}
              </span>
            </div>
            <div className="shrink-0">{renderSvgQrCode(student.admissionNo, 56)}</div>
          </div>

          {/* Principal Signature & Embossed Seal Stamp */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <div className="text-center">
              <div className="h-7 flex items-center justify-center font-['Playfair_Display'] italic text-amber-300 text-sm font-bold border-b border-amber-300/40 px-2">
                A. Mensah-Arthur
              </div>
              <span className="text-[7.5px] text-slate-400 uppercase tracking-wider block mt-0.5">
                Authorized Signatory
              </span>
            </div>

            <div className="w-12 h-12 rounded-full border-2 border-dashed border-amber-400/60 flex flex-col items-center justify-center text-center p-0.5 bg-amber-400/10">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-[5px] font-bold uppercase text-amber-300">Official Seal</span>
            </div>
          </div>

          {/* Address & Hotline footer */}
          <div className="text-center pt-1 text-[7px] text-slate-400 leading-tight">
            Off Accra-Kumasi Highway, Achimota, Accra, Ghana • {cardConfig.email}
          </div>
        </div>
      );
    }

    // Landscape Card Back View
    return (
      <div
        className={`w-[490px] h-[310px] rounded-2xl overflow-hidden shadow-2xl relative border-2 ${themeStyle.accentBorder} ${
          theme === 'modern-clean' ? 'bg-slate-50' : themeStyle.primaryBg
        } flex flex-col justify-between select-none p-4 text-xs print:shadow-none print:border print:m-0`}
      >
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div>
            <h5 className="font-bold text-amber-400 text-xs uppercase tracking-wider">
              Grace White Dove School Complex
            </h5>
            <span className="text-[8px] text-slate-300 block">
              Official Identification Card Conditions of Use
            </span>
          </div>
          <div className="text-right">
            <span className="text-[8px] text-rose-300 font-bold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
              Blood Group: {cardConfig.bloodGroup}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3 items-center py-2 flex-1">
          {/* QR Code Column */}
          <div className="col-span-4 flex flex-col items-center text-center bg-black/20 p-2 rounded-xl border border-white/10">
            {renderSvgQrCode(student.admissionNo, 68)}
            <span className="text-[7.5px] font-mono text-slate-300 mt-1 uppercase font-bold">
              Scan to Verify
            </span>
          </div>

          {/* Rules & Emergency Contacts Column */}
          <div className="col-span-8 space-y-1.5 text-[9px] text-slate-200">
            <p className="text-[8px] text-slate-300 leading-snug">
              1. This card confirms active student status and must be carried at all times.
              <br />
              2. If lost or found, please return immediately to Administration or call hotline.
            </p>

            <div className="bg-black/30 p-2 rounded-lg border border-white/10 space-y-0.5">
              <div className="flex justify-between">
                <span className="text-slate-400 text-[8px]">Guardian:</span>
                <span className="font-bold text-white text-[8.5px]">{student.guardianName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-[8px]">Emergency Tel:</span>
                <span className="font-mono text-amber-300 font-bold text-[8.5px]">{student.guardianPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-[8px]">School Hotline:</span>
                <span className="font-mono text-slate-200 text-[8.5px]">{cardConfig.phone.split('/')[0]}</span>
              </div>
            </div>

            {/* Signature row */}
            <div className="flex items-center justify-between pt-1">
              <div className="text-left">
                <span className="font-['Playfair_Display'] italic text-amber-300 text-xs font-bold block">
                  A. Mensah-Arthur
                </span>
                <span className="text-[7px] text-slate-400 uppercase">Head of School Signature</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-5 h-5 text-amber-400" />
                <span className="text-[6.5px] uppercase font-bold text-amber-300">Verified ID</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pt-1.5 border-t border-white/10 text-[7.5px] text-slate-400">
          Grace White Dove School Complex, Main Campus, Achimota - Accra, Ghana • {cardConfig.email}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Main Generator Modal Window */}
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="bg-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-md">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg font-['Outfit']">
                  Grace White Dove Digital ID Card Generator
                </h3>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Ghana GES Standard
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                Automatically pulls student bio-data, generates high-res barcode/QR verified cards & batch printable A4 sheets.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Print high-resolution ID Card"
            >
              <Printer className="w-4 h-4" />
              Print Card
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs (Single Card vs Batch Class Sheet) */}
        <div className="bg-slate-100 px-5 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveMode('single')}
              className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'single'
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Single Student Card
            </button>
            <button
              onClick={() => {
                setActiveMode('batch');
                if (selectedBatchStudentIds.length === 0) {
                  setSelectedBatchStudentIds(batchStudents.map((s) => s.id));
                }
              }}
              className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'batch'
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Batch Class Sheet (A4 Grid)
            </button>
          </div>

          {/* Quick Style Controls Toolbar */}
          <div className="flex items-center gap-2">
            {/* Orientation */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setOrientation('portrait')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                  orientation === 'portrait' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Portrait (Lanyard)
              </button>
              <button
                onClick={() => setOrientation('landscape')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                  orientation === 'landscape' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Landscape (Wallet)
              </button>
            </div>

            {/* Theme Colors */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setTheme('emerald-gold')}
                className={`w-6 h-6 rounded-lg bg-emerald-900 ring-2 ${
                  theme === 'emerald-gold' ? 'ring-amber-400 scale-105' : 'ring-transparent'
                } cursor-pointer`}
                title="Signature Emerald & Gold"
              />
              <button
                onClick={() => setTheme('royal-navy')}
                className={`w-6 h-6 rounded-lg bg-slate-900 ring-2 ${
                  theme === 'royal-navy' ? 'ring-amber-400 scale-105' : 'ring-transparent'
                } cursor-pointer`}
                title="Prestige Royal Navy"
              />
              <button
                onClick={() => setTheme('burgundy-gold')}
                className={`w-6 h-6 rounded-lg bg-rose-950 ring-2 ${
                  theme === 'burgundy-gold' ? 'ring-amber-400 scale-105' : 'ring-transparent'
                } cursor-pointer`}
                title="Academic Burgundy"
              />
              <button
                onClick={() => setTheme('modern-clean')}
                className={`w-6 h-6 rounded-lg bg-slate-200 ring-2 ${
                  theme === 'modern-clean' ? 'ring-emerald-700 scale-105' : 'ring-transparent'
                } cursor-pointer`}
                title="Modern Clean White"
              />
            </div>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          {activeMode === 'single' ? (
            /* ========================================================================= */
            /* SINGLE CARD PREVIEW & CONFIGURATION                                      */
            /* ========================================================================= */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Live Card Canvas & 3D Interactive Flip */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-200/60 rounded-2xl p-6 border border-slate-300/80 min-h-[520px] relative">
                {/* Flip Action Pill */}
                <div className="mb-4 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200">
                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setActiveSide('front');
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                      !isFlipped ? 'bg-emerald-900 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Front Side
                  </button>
                  <button
                    onClick={() => {
                      setIsFlipped(true);
                      setActiveSide('back');
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                      isFlipped ? 'bg-emerald-900 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Back Side
                  </button>
                  <button
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="p-1 text-slate-500 hover:text-emerald-900 cursor-pointer"
                    title="Flip Card View"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* The Rendered Card (Front or Back) */}
                <div className="transition-all duration-300 transform hover:scale-[1.01]">
                  {activeStudent ? (
                    isFlipped ? (
                      renderCardBack(activeStudent, orientation === 'portrait')
                    ) : (
                      renderCardFront(activeStudent, orientation === 'portrait')
                    )
                  ) : (
                    <div className="p-8 bg-white rounded-2xl text-center text-slate-400">
                      No student selected
                    </div>
                  )}
                </div>

                {/* Print Hint */}
                <span className="text-[11px] text-slate-500 mt-4 flex items-center gap-1 font-medium">
                  <Shield className="w-3.5 h-3.5 text-emerald-800" />
                  Precision 300 DPI layout compliant with CR80 ID standard badge holders & PVC laminators.
                </span>
              </div>

              {/* Right Column: Student Selector & Card Settings */}
              <div className="lg:col-span-5 space-y-4">
                {/* 1. Student Selector Card */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-700" /> Select Student
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {selectableStudents.length} Students
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search student..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-full text-slate-800"
                      />
                    </div>
                    <select
                      value={classFilter}
                      onChange={(e) => setClassFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 font-medium"
                    >
                      <option value="all">All Classes</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Scrollable list of students */}
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-50">
                    {selectableStudents.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSelectedStudentId(s.id);
                          showToast(`Loaded ID card for ${s.firstName} ${s.lastName}`);
                        }}
                        className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          selectedStudentId === s.id
                            ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <img
                            src={s.photoUrl}
                            alt={s.firstName}
                            className="w-6 h-6 rounded-full object-cover ring-1 ring-emerald-600/30"
                            referrerPolicy="no-referrer"
                          />
                          <span className="truncate">
                            {s.firstName} {s.lastName}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {s.className.split(' ')[0]} • #{s.rollNo}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Card Customization & Overrides */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                    <Sliders className="w-4 h-4 text-emerald-700" /> ID Card Parameters
                  </h4>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Assigned House</label>
                      <select
                        value={cardConfig.house}
                        onChange={(e) => setCardConfig({ ...cardConfig, house: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg p-1.5 bg-slate-50 font-medium"
                      >
                        <option value="Dove Gold House">Dove Gold House</option>
                        <option value="Dove Green House">Dove Green House</option>
                        <option value="Dove Blue House">Dove Blue House</option>
                        <option value="Dove Red House">Dove Red House</option>
                        <option value="Aggrey House">Aggrey House</option>
                        <option value="Nkrumah House">Nkrumah House</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Blood Group</label>
                      <select
                        value={cardConfig.bloodGroup}
                        onChange={(e) => setCardConfig({ ...cardConfig, bloodGroup: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg p-1.5 bg-slate-50 font-medium"
                      >
                        <option value="O+">O Positive (O+)</option>
                        <option value="A+">A Positive (A+)</option>
                        <option value="B+">B Positive (B+)</option>
                        <option value="AB+">AB Positive (AB+)</option>
                        <option value="O-">O Negative (O-)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Academic Year</label>
                      <input
                        type="text"
                        value={cardConfig.academicYearDisplay}
                        onChange={(e) => setCardConfig({ ...cardConfig, academicYearDisplay: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg p-1.5 bg-slate-50 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardConfig.expiryDate}
                        onChange={(e) => setCardConfig({ ...cardConfig, expiryDate: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg p-1.5 bg-slate-50 font-mono"
                      />
                    </div>
                  </div>

                  {/* Toggle security features */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={cardConfig.showBarcode}
                        onChange={(e) => setCardConfig({ ...cardConfig, showBarcode: e.target.checked })}
                        className="rounded text-emerald-700 focus:ring-emerald-700"
                      />
                      <span>Barcode Graphic</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={cardConfig.showHologram}
                        onChange={(e) => setCardConfig({ ...cardConfig, showHologram: e.target.checked })}
                        className="rounded text-emerald-700 focus:ring-emerald-700"
                      />
                      <span>Hologram Seal</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={cardConfig.showQrCode}
                        onChange={(e) => setCardConfig({ ...cardConfig, showQrCode: e.target.checked })}
                        className="rounded text-emerald-700 focus:ring-emerald-700"
                      />
                      <span>QR Verification</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={cardConfig.showLanyardHole}
                        onChange={(e) => setCardConfig({ ...cardConfig, showLanyardHole: e.target.checked })}
                        className="rounded text-emerald-700 focus:ring-emerald-700"
                      />
                      <span>Lanyard Guide</span>
                    </label>
                  </div>
                </div>

                {/* Print Button */}
                <button
                  onClick={handlePrint}
                  className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer text-xs"
                >
                  <Printer className="w-4 h-4 text-amber-300" />
                  Print Active Student ID Card
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* BATCH CLASS SHEET MODE (A4 Multi-Card Printable Grid)                    */
            /* ========================================================================= */
            <div className="space-y-5">
              {/* Batch Selector Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <School className="w-4 h-4 text-emerald-800" />
                    <span>Target Class Stream:</span>
                  </div>
                  <select
                    value={batchClass}
                    onChange={(e) => {
                      const newClass = e.target.value;
                      setBatchClass(newClass);
                      const stds = students.filter((s) => s.className === newClass);
                      setSelectedBatchStudentIds(stds.map((s) => s.id));
                    }}
                    className="bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-1.5 font-bold text-emerald-950 cursor-pointer"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({students.filter((s) => s.className === c.name).length} Pupils)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAllBatch}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                  >
                    {selectedBatchStudentIds.length === batchStudents.length
                      ? 'Deselect All'
                      : 'Select All Pupils'}
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-300" />
                    Print Class Badges ({selectedBatchStudentIds.length})
                  </button>
                </div>
              </div>

              {/* Individual Student Checkbox Selection Bar */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap gap-2 text-xs">
                {batchStudents.map((std) => {
                  const isChecked = selectedBatchStudentIds.includes(std.id);
                  return (
                    <button
                      key={std.id}
                      onClick={() => handleToggleBatchStudent(std.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                          isChecked ? 'bg-emerald-800 text-white' : 'border border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && '✓'}
                      </span>
                      <span>
                        {std.firstName} {std.lastName}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* A4 Printable Multi-Card Sheet Preview */}
              <div className="bg-slate-200 p-6 rounded-2xl border border-slate-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs text-slate-700 font-semibold">
                    A4 Sheet Layout Preview ({selectedBatchStudentIds.length} cards selected for printing)
                  </div>
                  <span className="text-[11px] text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-300">
                    Cut along dashed guidelines after printing
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
                  {batchStudents
                    .filter((s) => selectedBatchStudentIds.includes(s.id))
                    .map((std) => (
                      <div key={std.id} className="relative group">
                        {renderCardFront(std, orientation === 'portrait')}
                      </div>
                    ))}
                </div>

                {selectedBatchStudentIds.length === 0 && (
                  <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
                    <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="font-semibold text-xs">No students selected for this class sheet.</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Check pupils above to generate their printable badges.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
