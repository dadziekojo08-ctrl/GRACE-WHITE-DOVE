import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Trash2,
  Check,
  X,
  Link as LinkIcon,
  Video,
  VideoOff,
  UserCheck
} from 'lucide-react';

export interface StaffPhotoUploaderProps {
  value?: string;
  onChange: (photoUrl: string) => void;
  name?: string;
  role?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  helperText?: string;
  inline?: boolean;
}

const PRESET_AVATARS = [
  // Professional Educator Portraits (Unsplash High Quality Headshots)
  {
    id: 'p1',
    label: 'Educator 1',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    tag: 'Teacher'
  },
  {
    id: 'p2',
    label: 'Educator 2',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    tag: 'Head of Dept'
  },
  {
    id: 'p3',
    label: 'Educator 3',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    tag: 'Principal'
  },
  {
    id: 'p4',
    label: 'Educator 4',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    tag: 'Administrator'
  },
  {
    id: 'p5',
    label: 'Educator 5',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    tag: 'Librarian'
  },
  {
    id: 'p6',
    label: 'Educator 6',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80',
    tag: 'Bursar/Accountant'
  },
  {
    id: 'p7',
    label: 'Educator 7',
    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&auto=format&fit=crop&q=80',
    tag: 'Teacher'
  },
  {
    id: 'p8',
    label: 'Educator 8',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
    tag: 'ICT Coordinator'
  },
  // Modern Vector Styled Avatars
  {
    id: 'v1',
    label: 'Avatar Blue',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NanaKwame&eyebrows=default&facialHair=none&top=shortHair',
    tag: 'Vector'
  },
  {
    id: 'v2',
    label: 'Avatar Emerald',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MaryMensah&eyebrows=default&hairColor=auburn&top=longHair',
    tag: 'Vector'
  },
  {
    id: 'v3',
    label: 'Avatar Amber',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SamuelBoateng&glasses=round&top=shortHair',
    tag: 'Vector'
  },
  {
    id: 'v4',
    label: 'Avatar Purple',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GraceDove&top=curly',
    tag: 'Vector'
  }
];

export const StaffPhotoUploader: React.FC<StaffPhotoUploaderProps> = ({
  value,
  onChange,
  name = 'Staff Member',
  role,
  size = 'md',
  label = 'Staff Profile Picture',
  helperText = 'Upload a real photo, capture via camera, or select a preset avatar.',
  inline = false
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'presets' | 'url'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [urlPreview, setUrlPreview] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const currentPhoto = value || (name ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}` : '');

  // Size definitions
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  // Stop camera when closing modal or switching away from camera tab
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleStartCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      setCameraError(err.message || 'Unable to access camera. Please allow camera permissions.');
      setCameraActive(false);
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = 400;
    canvas.height = 400;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw centered square crop
      const startX = (video.videoWidth - size) / 2;
      const startY = (video.videoHeight - size) / 2;
      ctx.drawImage(video, startX, startY, size, size, 0, 0, 400, 400);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      onChange(dataUrl);
      stopCamera();
      setIsModalOpen(false);
    }
  };

  // File processing (Resize to Max 600px width/height to keep storage small & fast)
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onChange(compressedDataUrl);
          setIsModalOpen(false);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setUrlError('Please enter an image URL.');
      return;
    }
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:image')) {
      setUrlError('URL must start with http:// or https://');
      return;
    }
    onChange(trimmed);
    setUrlInput('');
    setUrlPreview(null);
    setIsModalOpen(false);
  };

  const handleGenerateRandomAvatar = () => {
    const randomSeed = `Staff-${Math.random().toString(36).substring(2, 9)}`;
    const randomAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(randomSeed)}`;
    onChange(randomAvatar);
  };

  const handleResetToDefault = () => {
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'Staff')}`;
    onChange(defaultAvatar);
    setIsModalOpen(false);
  };

  return (
    <div className="w-full">
      {/* Hidden native input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept="image/png, image/jpeg, image/webp, image/gif"
        className="hidden"
      />

      {/* Main Trigger / Preview Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100">
        {/* Avatar Display with Hover Overlay */}
        <div className="relative group shrink-0">
          <div
            onClick={() => setIsModalOpen(true)}
            className={`${sizeClasses[size]} rounded-2xl overflow-hidden bg-emerald-950/10 border-2 border-emerald-600/30 shadow-sm cursor-pointer relative transition-transform group-hover:scale-105`}
            title="Click to Add or Change Picture"
          >
            {currentPhoto ? (
              <img
                src={currentPhoto}
                alt={name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-emerald-900 text-amber-300 font-bold text-lg">
                {name.slice(0, 2).toUpperCase()}
              </div>
            )}

            {/* Hover overlay with Camera Icon */}
            <div className="absolute inset-0 bg-emerald-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
              <Camera className="w-5 h-5 text-amber-300 mb-0.5" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Change</span>
            </div>
          </div>

          {/* Small edit trigger badge on corner */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="absolute -bottom-1 -right-1 bg-amber-400 hover:bg-amber-300 text-emerald-950 p-1 rounded-full shadow-md border-2 border-white transition-all cursor-pointer"
            title="Edit Picture"
          >
            <Camera className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>

        {/* Text & Quick Action Controls */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs font-bold text-slate-900">{label}</span>
            {role && (
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                {role}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">{helperText}</p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="w-3 h-3 text-amber-300" />
              <span>Choose / Upload Picture</span>
            </button>

            <button
              type="button"
              onClick={handleGenerateRandomAvatar}
              className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="Generate new random style avatar"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Shuffle</span>
            </button>

            {value && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1 px-2 py-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs transition-colors cursor-pointer"
                title="Reset to default"
              >
                <Trash2 className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Full Photo Selection & Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              stopCamera();
              setIsModalOpen(false);
            }
          }}
        >
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-6">
            {/* Modal Header */}
            <div className="bg-emerald-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
                  <Camera className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white font-['Outfit']">Staff Picture Studio</h3>
                  <p className="text-[11px] text-emerald-200">
                    Upload, capture or pick a professional photo for <span className="text-amber-300 font-semibold">{name}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setIsModalOpen(false);
                }}
                className="text-white hover:text-amber-300 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Active Photo Banner */}
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center gap-4">
              <img
                src={currentPhoto}
                alt={name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-600 shadow-sm shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 truncate">{name}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <Check className="w-3 h-3" /> Live Profile Picture
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  This picture appears on staff ID cards, attendance registers, and user account profiles.
                </p>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-slate-200 bg-slate-100/60 px-4 pt-2 gap-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setActiveTab('upload');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-white text-emerald-900 border-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 border-transparent'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Device File
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('camera');
                  handleStartCamera();
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'camera'
                    ? 'bg-white text-emerald-900 border-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 border-transparent'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                Take Photo
              </button>

              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setActiveTab('presets');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'presets'
                    ? 'bg-white text-emerald-900 border-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 border-transparent'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Presets Gallery
              </button>

              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setActiveTab('url');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'url'
                    ? 'bg-white text-emerald-900 border-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 border-transparent'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                Image Link
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-5">
              {/* TAB 1: FILE UPLOAD (DRAG & DROP) */}
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      dragActive
                        ? 'border-emerald-600 bg-emerald-50 scale-[1.01]'
                        : 'border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/30'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 mb-1">
                      Drag & Drop your picture here, or <span className="text-emerald-700 underline">Browse</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Supports JPG, PNG, WebP up to 5MB. Images are automatically centered and optimized.
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">Need a quick placeholder instead?</span>
                    <button
                      type="button"
                      onClick={handleGenerateRandomAvatar}
                      className="text-emerald-800 font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Generate AI Style Avatar
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: LIVE CAMERA SNAPSHOT */}
              {activeTab === 'camera' && (
                <div className="space-y-3">
                  <canvas ref={canvasRef} className="hidden" />

                  {cameraError ? (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-2">
                      <VideoOff className="w-8 h-8 text-rose-500 mx-auto" />
                      <p className="text-xs font-bold text-rose-800">{cameraError}</p>
                      <p className="text-[11px] text-rose-600">
                        You can also upload a photo directly using the Upload tab or your phone camera.
                      </p>
                      <button
                        type="button"
                        onClick={handleStartCamera}
                        className="px-3 py-1.5 bg-rose-700 text-white rounded-lg text-xs font-bold hover:bg-rose-800 cursor-pointer"
                      >
                        Retry Camera Permission
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-56 flex items-center justify-center border border-slate-800 shadow-inner">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover mirror"
                        />
                        {/* Target alignment ring */}
                        <div className="absolute inset-0 border-2 border-white/40 pointer-events-none flex items-center justify-center">
                          <div className="w-36 h-36 rounded-full border-2 border-dashed border-amber-400/80"></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={handleCapturePhoto}
                          className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Camera className="w-4 h-4 text-amber-300" />
                          <span>Capture Photo</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PROFESSIONAL PRESETS GALLERY */}
              {activeTab === 'presets' && (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-500">
                    Select from high-quality professional educator and staff profile headshots:
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto p-1">
                    {PRESET_AVATARS.map((preset) => {
                      const isSelected = currentPhoto === preset.url;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            onChange(preset.url);
                            setIsModalOpen(false);
                          }}
                          className={`group relative rounded-xl p-1 border transition-all text-left flex flex-col items-center cursor-pointer ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600'
                              : 'border-slate-200 bg-white hover:border-emerald-400 hover:bg-slate-50'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-14 h-14 rounded-lg object-cover mb-1"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-[10px] font-bold text-slate-700 truncate w-full text-center">
                            {preset.label}
                          </span>
                          <span className="text-[8.5px] text-emerald-700 bg-emerald-100/80 px-1 rounded truncate">
                            {preset.tag}
                          </span>
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-emerald-600 text-white p-0.5 rounded-full shadow-xs">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: DIRECT IMAGE URL */}
              {activeTab === 'url' && (
                <form onSubmit={handleUrlSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Paste Public Image Web Link (HTTPS)
                    </label>
                    <div className="relative">
                      <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => {
                          setUrlInput(e.target.value);
                          setUrlError(null);
                        }}
                        placeholder="https://images.example.com/staff-photo.jpg"
                        className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                      />
                    </div>
                    {urlError && <p className="text-[11px] text-rose-600 mt-1 font-semibold">{urlError}</p>}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4 text-amber-300" />
                    <span>Apply Image URL</span>
                  </button>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-xs text-slate-500 hover:text-rose-600 font-semibold cursor-pointer"
              >
                Reset to Default Avatar
              </button>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setIsModalOpen(false);
                }}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
