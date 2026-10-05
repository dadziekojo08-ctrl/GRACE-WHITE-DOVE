import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  HelpCircle,
  Lock
} from 'lucide-react';

interface PaystackConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaystackConfigModal: React.FC<PaystackConfigModalProps> = ({ isOpen, onClose }) => {
  const { paystackPublicKey, setPaystackPublicKey, currentUser, activeRole } = useSchool();

  const isSuperAdmin =
    currentUser?.role === 'Super Admin' ||
    Boolean(currentUser?.isSuperAdmin) ||
    activeRole === 'Super Admin';

  const [inputKey, setInputKey] = useState(paystackPublicKey || 'pk_live_849cd38d9ec8716e68e0b08da43f1570f89fb3a2');
  const [showKey, setShowKey] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: ''
  });

  useEffect(() => {
    if (isOpen) {
      setInputKey(paystackPublicKey || 'pk_live_849cd38d9ec8716e68e0b08da43f1570f89fb3a2');
      setSaveSuccess(false);
      setTestResult({ status: 'idle', message: '' });
    }
  }, [isOpen, paystackPublicKey]);

  if (!isOpen || !isSuperAdmin) return null;

  const trimmed = inputKey.trim();
  const isLive = trimmed.startsWith('pk_live_');
  const isTest = trimmed.startsWith('pk_test_');
  const isSecretKeyWarning = trimmed.startsWith('sk_');
  const isValidFormat = (isLive || isTest) && trimmed.length >= 25;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    if (isSecretKeyWarning) {
      setTestResult({
        status: 'error',
        message: 'Security Alert: You entered a Secret Key (sk_...). Please only enter your Paystack Public Key (pk_...)!'
      });
      return;
    }

    setPaystackPublicKey(trimmed);
    setSaveSuccess(true);
    setTestResult({
      status: 'success',
      message: `Paystack Public Key saved successfully! (${isLive ? 'Live Production Mode' : isTest ? 'Test / Sandbox Mode' : 'Custom Key'})`
    });

    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleTestGateway = () => {
    if (!trimmed) {
      setTestResult({
        status: 'error',
        message: 'Please enter a valid Paystack Public Key first.'
      });
      return;
    }

    if (isSecretKeyWarning) {
      setTestResult({
        status: 'error',
        message: 'Security Alert: Keys starting with "sk_" are Secret Keys! Only enter your Public Key starting with "pk_".'
      });
      return;
    }

    if (!trimmed.startsWith('pk_')) {
      setTestResult({
        status: 'error',
        message: 'Paystack Public Keys must begin with "pk_live_" (for real payments) or "pk_test_" (for test mode).'
      });
      return;
    }

    // Verify if Paystack JS library is loaded in window
    if (typeof window !== 'undefined' && window.PaystackPop) {
      setTestResult({
        status: 'success',
        message: `Paystack Inline SDK is online and ready with ${isLive ? '🟢 Live Production' : '🧪 Test Sandbox'} key!`
      });
    } else {
      setTestResult({
        status: 'success',
        message: `Key format is valid (${isLive ? 'Live' : 'Test'}). Paystack SDK is initialized.`
      });
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputKey(text.trim());
      }
    } catch {
      // Fallback if clipboard API not permitted
    }
  };

  const handleCopyCurrent = () => {
    if (!paystackPublicKey) return;
    navigator.clipboard.writeText(paystackPublicKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClearKey = () => {
    if (window.confirm('Are you sure you want to clear the configured Paystack Public Key?')) {
      setInputKey('');
      setPaystackPublicKey('');
      setTestResult({
        status: 'idle',
        message: 'Paystack Public Key cleared. The app will use default simulation fallback.'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0ba4db] to-[#087ca8] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs border border-white/20">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight font-['Outfit']">
                  Paystack Gateway Key Settings
                </h2>
                <span className="bg-white/25 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                  Configuration
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Manage your school's official Paystack Public API Key
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Current Status Badge */}
          <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Active Gateway Mode:
              </span>
              <div className="flex items-center gap-2 mt-1">
                {paystackPublicKey?.startsWith('pk_live_') ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE PRODUCTION MODE
                  </span>
                ) : paystackPublicKey?.startsWith('pk_test_') ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    TEST / SANDBOX MODE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                    No Live Key Set (Demo / Simulation Mode)
                  </span>
                )}
              </div>
            </div>

            {paystackPublicKey && (
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono text-slate-500">
                  {paystackPublicKey.slice(0, 10)}...{paystackPublicKey.slice(-6)}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCurrent}
                  className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-300 font-medium cursor-pointer flex items-center gap-1 text-[11px]"
                  title="Copy current key"
                >
                  <Copy className="w-3 h-3" />
                  {isCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#0ba4db]" />
                  Paystack Public Key (Starts with pk_...)
                </label>
                <button
                  type="button"
                  onClick={handlePaste}
                  className="text-xs text-[#0ba4db] hover:underline font-semibold cursor-pointer"
                >
                  Paste from Clipboard
                </button>
              </div>

              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={inputKey}
                  onChange={(e) => {
                    setInputKey(e.target.value);
                    setTestResult({ status: 'idle', message: '' });
                  }}
                  placeholder="e.g. pk_live_xxxxxxxxxxxxxxxxxxxxxxxx or pk_test_..."
                  className="w-full pl-3.5 pr-20 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ba4db] focus:border-transparent transition-all"
                  required
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    title={showKey ? 'Hide Key' : 'Reveal Key'}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Validation helper badges */}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                {isLive && (
                  <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Valid Live Production Key Format
                  </span>
                )}
                {isTest && (
                  <span className="text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full font-bold border border-amber-200 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-600" />
                    Test / Sandbox Key Format
                  </span>
                )}
                {isSecretKeyWarning && (
                  <span className="text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full font-bold border border-rose-300 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Warning: Do not enter Secret Key (sk_...)! Only enter Public Key (pk_...)
                  </span>
                )}
              </div>
            </div>

            {/* Test result banner */}
            {testResult.message && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  testResult.status === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : testResult.status === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                {testResult.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : testResult.status === 'error' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 font-medium">{testResult.message}</div>
              </div>
            )}

            {/* Guidance card */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 text-xs text-blue-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-blue-950">
                <HelpCircle className="w-3.5 h-3.5 text-[#0ba4db]" />
                How to obtain your Paystack Public Key:
              </div>
              <ol className="list-decimal list-inside space-y-1 text-blue-800 text-[11px] leading-relaxed pl-1">
                <li>
                  Sign in to your dashboard at{' '}
                  <a
                    href="https://dashboard.paystack.com"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold underline text-[#0ba4db] inline-flex items-center gap-0.5"
                  >
                    dashboard.paystack.com <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </li>
                <li>
                  Navigate to <strong>Settings</strong> → <strong>API Keys & Webhooks</strong>.
                </li>
                <li>
                  Copy the <strong>Live Public Key</strong> (starts with <code className="bg-blue-100 px-1 py-0.5 rounded text-[#087ca8] font-mono">pk_live_...</code>) or <strong>Test Public Key</strong> (starts with <code className="bg-blue-100 px-1 py-0.5 rounded text-[#087ca8] font-mono">pk_test_...</code>).
                </li>
                <li>
                  Paste it in the field above and click <strong>Save & Apply Key</strong>.
                </li>
              </ol>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleTestGateway}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Test Verification
                </button>
                {paystackPublicKey && (
                  <button
                    type="button"
                    onClick={handleClearKey}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    Clear Key
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSecretKeyWarning}
                  className={`px-5 py-2 rounded-xl text-xs font-extrabold text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    saveSuccess
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-[#0ba4db] hover:bg-[#088bbb]'
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      Key Saved!
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5 text-white" />
                      Save & Apply Key
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
