import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import {
  processStudentPhotoFile,
  processStudentPhotoDataUrl,
  getDefaultStudentAvatar
} from '../../utils/imageUtils';

interface StudentPhotoUploadProps {
  currentPhotoUrl?: string;
  studentName?: string;
  onPhotoChange: (photoDataUrl: string) => void;
  label?: string;
  helperText?: string;
  compact?: boolean;
}

export const StudentPhotoUpload: React.FC<StudentPhotoUploadProps> = ({
  currentPhotoUrl = '',
  studentName = 'Student',
  onPhotoChange,
  label = 'Passport Photo for ID Card',
  helperText = 'Upload a clear front-facing portrait photo for school ID card printing.',
  compact = false
}) => {
  const [photoPreview, setPhotoPreview] = useState<string>(currentPhotoUrl);
  const [photoSizeKb, setPhotoSizeKb] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Camera Capture State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync with incoming prop if it changes externally
  useEffect(() => {
    if (currentPhotoUrl) {
      setPhotoPreview(currentPhotoUrl);
      if (currentPhotoUrl.startsWith('data:image')) {
        const kb = Math.round((currentPhotoUrl.length * 3) / 4 / 1024);
        setPhotoSizeKb(kb);
      }
    }
  }, [currentPhotoUrl]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  const startCamera = async () => {
    setErrorMessage(null);
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by this browser. Please use file upload.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });

      streamRef.current = stream;
      setIsCameraActive(true);

      // Attach to video element once mounted
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 50);
    } catch (err: any) {
      console.error('Camera access error:', err);
      let msg = 'Unable to access camera. Please check camera permissions or upload an image file.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission was denied. Please allow camera access in your browser or upload a photo.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera device was detected on your device. Please upload a photo file.';
      }
      setCameraError(msg);
      setIsCameraActive(false);
    }
  };

  const handleCaptureCamera = async () => {
    if (!videoRef.current) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize canvas');

      // Draw current video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const rawDataUrl = canvas.toDataURL('image/jpeg', 0.92);

      // Stop camera
      stopCamera();

      // Optimize and crop to passport aspect ratio
      const processed = await processStudentPhotoDataUrl(rawDataUrl);
      setPhotoPreview(processed.dataUrl);
      setPhotoSizeKb(processed.sizeKb);
      onPhotoChange(processed.dataUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to capture photo from camera.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const processed = await processStudentPhotoFile(file);
      setPhotoPreview(processed.dataUrl);
      setPhotoSizeKb(processed.sizeKb);
      onPhotoChange(processed.dataUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process selected image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemovePhoto = () => {
    const fallback = getDefaultStudentAvatar(studentName);
    setPhotoPreview(fallback);
    setPhotoSizeKb(0);
    onPhotoChange(fallback);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isCustomUploaded = photoPreview && photoPreview.startsWith('data:image');

  return (
    <div className="space-y-3">
      {/* Label and Guidance */}
      <div className="flex items-center justify-between">
        <div>
          <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
            {label}
          </label>
          {helperText && !compact && (
            <p className="text-[10px] text-slate-500 mt-0.5">{helperText}</p>
          )}
        </div>
        {isCustomUploaded && (
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            ID Card Ready {photoSizeKb > 0 ? `(${photoSizeKb} KB)` : ''}
          </span>
        )}
      </div>

      {/* Camera Live Viewfinder Mode */}
      {isCameraActive ? (
        <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500 shadow-lg text-white space-y-3">
          <div className="relative w-full max-w-[320px] mx-auto aspect-[3/4] bg-black rounded-xl overflow-hidden border-2 border-emerald-400">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Passport Framing Guidelines */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="w-48 h-60 border-2 border-dashed border-amber-300/80 rounded-[45%] shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] flex items-center justify-center">
                <span className="text-[10px] text-amber-300 font-bold bg-black/70 px-2 py-0.5 rounded">
                  Align Head & Face
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleCaptureCamera}
              disabled={isProcessing}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-md cursor-pointer transition-all disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              {isProcessing ? 'Optimizing...' : 'Take Photo'}
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Standard Upload / Preview Container */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`p-3.5 rounded-2xl border transition-all ${
            isDragOver
              ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
              : 'border-slate-200 bg-slate-50/80 hover:bg-slate-50'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Photo Avatar / Frame */}
            <div className="relative shrink-0">
              <div className="w-24 h-28 rounded-xl overflow-hidden ring-2 ring-emerald-700/20 bg-white shadow-xs border border-slate-200 relative group">
                <img
                  src={photoPreview || getDefaultStudentAvatar(studentName)}
                  alt={studentName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Graceful fallback to initial avatar if image fails
                    (e.target as HTMLImageElement).src = getDefaultStudentAvatar(studentName);
                  }}
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
              </div>

              {isCustomUploaded && (
                <span className="absolute -bottom-1.5 -right-1 bg-emerald-700 text-white rounded-full p-1 shadow-xs border border-white">
                  <CheckCircle2 className="w-3 h-3" />
                </span>
              )}
            </div>

            {/* Action Buttons & Drag Hint */}
            <div className="flex-1 space-y-2 text-center sm:text-left w-full">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {/* File Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-900 border border-slate-300 hover:border-emerald-500 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-700" />
                  Upload Photo
                </button>

                {/* Webcam Snapshot Button */}
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={isProcessing}
                  className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all disabled:opacity-50"
                  title="Take portrait with device camera"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-300" />
                  Snap Camera
                </button>

                {/* Clear / Reset Button */}
                {isCustomUploaded && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Remove custom photo and use default avatar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <p className="text-[11px] text-slate-500">
                Drag and drop image here, or snap with laptop/phone camera. Auto-cropped to ID card specifications.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Feedback */}
      {(errorMessage || cameraError) && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage || cameraError}</span>
        </div>
      )}
    </div>
  );
};
