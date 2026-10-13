import React, { useState } from 'react';
import {
  X,
  MapPin,
  Building,
  Phone,
  Mail,
  Calendar,
  Clock,
  User,
  Paperclip,
  Download,
  Send,
  Wrench,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { Engineer, Ticket, UserRole } from '../types/ticket';
import { PriorityIndicator, StatusIndicator } from './StatusBadge';
import { addTicketNote } from '../services/ticketStorage';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  currentRole: UserRole;
  onRefresh: () => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  onClose,
  currentRole,
  onRefresh,
}) => {
  if (!ticket) return null;

  const [newNote, setNewNote] = useState('');
  const [authorName, setAuthorName] = useState(
    currentRole === 'customer'
      ? ticket.customerName
      : currentRole === 'engineer'
      ? ticket.assignedEngineerName || 'Field Technician'
      : currentRole === 'admin'
      ? 'ADN NOC Dispatch'
      : 'Executive Stakeholder'
  );

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const roleMap: Record<UserRole, 'Customer' | 'Admin' | 'Engineer'> = {
      customer: 'Customer',
      admin: 'Admin',
      engineer: 'Engineer',
      stakeholder: 'Admin',
    };

    addTicketNote(ticket.id, authorName, roleMap[currentRole], newNote.trim());
    setNewNote('');
    onRefresh();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg text-blue-300">
                {ticket.id}
              </span>
              <PriorityIndicator priority={ticket.priority} />
              <StatusIndicator status={ticket.status} />
              {ticket.isSampleData && (
                <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded">
                  Sample Data
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              {ticket.category}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <span>{ticket.companyName}</span>
              <span>·</span>
              <span>Logged on {new Date(ticket.createdAt).toLocaleString()}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Customer & Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="space-y-1.5">
              <span className="text-slate-500 font-medium uppercase tracking-wider text-[10px] block">
                Customer Contact
              </span>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" />
                {ticket.customerName}
              </div>
              <div className="text-slate-600 flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{ticket.companyName}</span>
              </div>
              <div className="text-slate-600 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a href={`tel:${ticket.phoneNumber}`} className="hover:underline">
                  {ticket.phoneNumber}
                </a>
              </div>
              <div className="text-slate-600 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a href={`mailto:${ticket.emailAddress}`} className="hover:underline">
                  {ticket.emailAddress}
                </a>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-slate-500 font-medium uppercase tracking-wider text-[10px] block">
                Site & Technical Assignment
              </span>
              <div className="text-slate-700 flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{ticket.siteAddress}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200/60">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                  Assigned Lead:
                </span>
                <span className="font-semibold text-slate-900">
                  {ticket.assignedEngineerName || 'Unassigned (Awaiting NOC Dispatch)'}
                </span>
              </div>
            </div>
          </div>

          {/* Issue Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Incident Description & Scope
            </h3>
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>
          </div>

          {/* Optional Attachment */}
          {ticket.attachment && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Attached Media / File
              </h3>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center gap-3">
                  <Paperclip className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="font-semibold text-slate-800 block">
                      {ticket.attachment.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {(ticket.attachment.size / 1024).toFixed(1)} KB · {ticket.attachment.type || 'Attachment'}
                    </span>
                  </div>
                </div>

                {ticket.attachment.dataUrl && (
                  <a
                    href={ticket.attachment.dataUrl}
                    download={ticket.attachment.name}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 text-xs font-medium transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Resolution Summary (If resolved) */}
          {ticket.resolutionSummary && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Incident Resolution & Root Cause</span>
              </div>
              <p className="leading-relaxed text-emerald-900">{ticket.resolutionSummary}</p>
              {ticket.resolvedAt && (
                <p className="text-[11px] text-emerald-700 pt-1">
                  Closed on: {new Date(ticket.resolvedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Activity Log & Updates */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Chronological Activity & Incident Log ({ticket.activityLogs.length})
            </h3>
            <div className="space-y-3 pl-3 border-l-2 border-slate-200 ml-2">
              {ticket.activityLogs.map((log) => (
                <div key={log.id} className="relative pb-2">
                  <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                  <div className="text-xs flex items-center gap-2">
                    <span className="font-bold text-slate-800">{log.author}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                      {log.role}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-[11px] text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {log.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Add Note Form */}
          <form onSubmit={handleAddNote} className="pt-3 border-t border-slate-200 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Add Log Entry / Note
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Write an internal note or customer status update..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!newNote.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Alpha Data Network Incident Management Protocol
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
