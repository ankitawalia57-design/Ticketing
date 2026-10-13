import React from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Zap,
  Lock,
  ArrowRight,
  Database,
  Bell,
  HardDrive,
  IndianRupee,
} from 'lucide-react';

interface FreeTierRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FreeTierRoadmapModal: React.FC<FreeTierRoadmapModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-300 border border-blue-500/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Alpha Data Network Architecture & ₹0 Roadmap
              </h2>
              <p className="text-xs text-slate-400">
                Beginner Guide: 100% Free, Standalone, & Isolated from your VMS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
          {/* Key Guarantee 1: VMS Isolation */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <h3 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              1. 100% Standalone: Your CCTV/VMS is completely untouched
            </h3>
            <p className="mt-1 text-emerald-800 leading-relaxed">
              This ticketing system runs as an independent web application. It has zero code,
              zero network bridges, and zero database links to your Video Management System
              (VMS), CCTV cameras, or RTSP streams. Your video infrastructure remains completely safe and undisturbed.
            </p>
          </div>

          {/* Key Guarantee 2: ₹0 Budget Enforcement */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="font-bold text-blue-900 text-sm flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-blue-600" />
              2. Budget is ₹0: Free & Open Source First
            </h3>
            <p className="mt-1 text-blue-800 leading-relaxed">
              No paid plans, credit cards, or billing accounts were enabled. All current tickets,
              actions, and engineer dispatches run in browser storage for demonstration.
            </p>
          </div>

          {/* Phase 1 vs Phase 2 Comparison */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">
              Current Status vs Future Steps
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="font-bold text-blue-800 block text-xs">
                  ✅ Phase 1 (Completed Today):
                </span>
                <ul className="space-y-1.5 text-slate-600">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Customer ticket submission & confirmation screens</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Admin dispatch board with priority triage</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Field engineer work log & status updates</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Stakeholder analytics & CSV export</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>ADN-YYYY-000001 sequential ID formatting</span>
                  </li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="font-bold text-purple-800 block text-xs">
                  🚀 Phase 2 (Free-Tier Next Steps):
                </span>
                <ul className="space-y-1.5 text-slate-600">
                  <li className="flex items-start gap-1.5">
                    <Database className="w-3.5 h-3.5 text-purple-600 mt-0.5 shrink-0" />
                    <span>
                      <strong>Firebase Spark (₹0 free tier):</strong> Permanent cloud storage for tickets across devices.
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-purple-600 mt-0.5 shrink-0" />
                    <span>
                      <strong>Email alerts:</strong> Free transactional tier (e.g. Resend free 3,000 emails/mo) or free Gmail SMTP.
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-purple-600 mt-0.5 shrink-0" />
                    <span>
                      <strong>WhatsApp alerts:</strong> Standard free webhook or cloud trigger when you are ready.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Simple Explanation for Beginner */}
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 leading-relaxed">
            <span className="font-bold block mb-1">💡 For Beginners:</span>
            You can test this right now by creating new tickets, switching to the Admin view to
            assign engineers, switching to the Engineer view to log technical progress, and viewing
            the Stakeholder metrics. Everything refreshes instantly and persists across page reloads!
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition cursor-pointer"
          >
            Understood & Close
          </button>
        </div>
      </div>
    </div>
  );
};
