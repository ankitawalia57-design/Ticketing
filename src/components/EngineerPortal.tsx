import React, { useState } from 'react';
import {
  Wrench,
  CheckCircle,
  Clock,
  AlertCircle,
  FileCheck,
  Send,
  Building,
  MapPin,
  Phone,
  CheckSquare,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { Engineer, Ticket, TicketStatus } from '../types/ticket';
import { PriorityIndicator, StatusIndicator } from './StatusBadge';
import { updateTicketStatus } from '../services/ticketStorage';

interface EngineerPortalProps {
  tickets: Ticket[];
  engineers: Engineer[];
  onOpenTicketDetails: (ticket: Ticket) => void;
  onRefresh: () => void;
}

export const EngineerPortal: React.FC<EngineerPortalProps> = ({
  tickets,
  engineers,
  onOpenTicketDetails,
  onRefresh,
}) => {
  // Currently active engineer login simulator
  const [selectedEngineerId, setSelectedEngineerId] = useState<string>(
    engineers[2]?.id || engineers[0]?.id || '' // Default to Priya Nair or Rajesh Sharma
  );

  // Quick update modal state
  const [updatingTicket, setUpdatingTicket] = useState<Ticket | null>(null);
  const [newStatus, setNewStatus] = useState<TicketStatus>('In Progress');
  const [workLogNote, setWorkLogNote] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [checkedChecklist, setCheckedChecklist] = useState<Record<string, boolean>>({
    cabling: false,
    poeVoltage: false,
    nvrStream: false,
    customerSignoff: false,
  });

  const activeEngineer = engineers.find((e) => e.id === selectedEngineerId);

  // Tickets assigned to this engineer
  const assignedTickets = tickets.filter(
    (t) => t.assignedEngineerId === selectedEngineerId
  );

  const activeCount = assignedTickets.filter(
    (t) => t.status !== 'Resolved' && t.status !== 'Closed'
  ).length;

  const resolvedCount = assignedTickets.filter(
    (t) => t.status === 'Resolved' || t.status === 'Closed'
  ).length;

  const urgentCount = assignedTickets.filter(
    (t) => t.priority === 'Urgent' && t.status !== 'Resolved' && t.status !== 'Closed'
  ).length;

  const handleOpenUpdate = (ticket: Ticket) => {
    setUpdatingTicket(ticket);
    setNewStatus(ticket.status === 'Open' ? 'In Progress' : ticket.status);
    setWorkLogNote('');
    setResolutionSummary(ticket.resolutionSummary || '');
    setCheckedChecklist({
      cabling: false,
      poeVoltage: false,
      nvrStream: false,
      customerSignoff: false,
    });
  };

  const handleSubmitProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingTicket) return;

    const authorName = activeEngineer ? activeEngineer.name : 'ADN Field Engineer';
    
    // Assemble checklist into work notes if any checked
    let finalNote = workLogNote.trim();
    const verifiedTasks: string[] = [];
    if (checkedChecklist.cabling) verifiedTasks.push('Physical cabling & terminations inspected');
    if (checkedChecklist.poeVoltage) verifiedTasks.push('PoE switch voltage & link speed verified');
    if (checkedChecklist.nvrStream) verifiedTasks.push('NVR/VMS live channel stream checked');
    if (checkedChecklist.customerSignoff) verifiedTasks.push('On-site customer POC verbally confirmed restoration');

    if (verifiedTasks.length > 0) {
      const checklistStr = `[Verified on-site: ${verifiedTasks.join('; ')}]`;
      finalNote = finalNote ? `${finalNote} | ${checklistStr}` : checklistStr;
    }

    updateTicketStatus(
      updatingTicket.id,
      newStatus,
      authorName,
      'Engineer',
      finalNote,
      newStatus === 'Resolved' ? resolutionSummary : undefined
    );

    setUpdatingTicket(null);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Engineer Profile Switcher */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg border border-blue-200">
            <Wrench className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {activeEngineer ? activeEngineer.name : 'Field Engineer Queue'}
              </h1>
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                Active On Duty
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {activeEngineer?.role} · Contact: {activeEngineer?.phone}
            </p>
          </div>
        </div>

        {/* Engineer selection dropdown for demonstration */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto bg-slate-50 p-2 rounded-lg border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Switch Engineer:</span>
          <select
            value={selectedEngineerId}
            onChange={(e) => setSelectedEngineerId(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {engineers.map((eng) => (
              <option key={eng.id} value={eng.id}>
                {eng.name} ({eng.activeTicketsCount} active)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Engineer Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Active Queue</span>
            <div className="text-2xl font-bold text-blue-600 mt-0.5">{activeCount}</div>
            <span className="text-[11px] text-slate-400">Tickets in your queue</span>
          </div>
          <Clock className="w-8 h-8 text-blue-200" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Urgent Perimeter Items</span>
            <div className="text-2xl font-bold text-rose-600 mt-0.5">{urgentCount}</div>
            <span className="text-[11px] text-slate-400">Immediate attention</span>
          </div>
          <AlertCircle className="w-8 h-8 text-rose-200" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Successfully Resolved</span>
            <div className="text-2xl font-bold text-emerald-600 mt-0.5">{resolvedCount}</div>
            <span className="text-[11px] text-slate-400">Completed assignments</span>
          </div>
          <CheckCircle className="w-8 h-8 text-emerald-200" />
        </div>
      </div>

      {/* Assigned Tickets List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Tickets Assigned to You ({assignedTickets.length})
          </h2>
          <span className="text-xs text-slate-400">
            Click &ldquo;Update Progress&rdquo; to add site notes or close ticket
          </span>
        </div>

        {assignedTickets.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
            <CheckCircle className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
            <p className="text-sm font-medium text-slate-700">No tickets currently assigned</p>
            <p className="text-xs text-slate-400 mt-1">
              Switch to another engineer from the top dropdown or assign tickets via the Admin Dashboard.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {assignedTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:border-blue-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-700 text-sm">
                        {ticket.id}
                      </span>
                      <PriorityIndicator priority={ticket.priority} />
                      <StatusIndicator status={ticket.status} />
                      {ticket.isSampleData && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                          Sample
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5">
                      {ticket.category}: {ticket.companyName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenUpdate(ticket)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Update Progress</span>
                    </button>
                    <button
                      onClick={() => onOpenTicketDetails(ticket)}
                      className="border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium px-3 py-2 rounded-lg transition cursor-pointer"
                      title="Inspect complete history"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Site & Contact Meta */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-lg border border-slate-200/70">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{ticket.siteAddress}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {ticket.customerName} ({ticket.phoneNumber})
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-700 mt-3 line-clamp-2 leading-relaxed">
                  {ticket.description}
                </p>

                {/* Latest activity preview */}
                {ticket.activityLogs.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 truncate">
                      <MessageSquare className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-700">Latest Log:</span>
                      <span className="truncate">
                        {ticket.activityLogs[ticket.activityLogs.length - 1].message}
                      </span>
                    </div>
                    <span className="shrink-0 text-slate-400 ml-2">
                      {ticket.activityLogs.length} updates logged
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress Update Modal */}
      {updatingTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-blue-300 block">
                  Updating Ticket: {updatingTicket.id}
                </span>
                <h3 className="font-bold text-base text-white">
                  Field Progress & Resolution Log
                </h3>
              </div>
              <button
                onClick={() => setUpdatingTicket(null)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitProgress} className="p-5 sm:p-6 space-y-4">
              {/* Ticket Quick Banner */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="font-semibold text-slate-900">
                  {updatingTicket.category} · {updatingTicket.companyName}
                </div>
                <div className="text-slate-500 mt-0.5">{updatingTicket.siteAddress}</div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Change Ticket Status *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['In Progress', 'Waiting for Customer', 'Resolved'] as TicketStatus[]).map(
                    (st) => (
                      <button
                        type="button"
                        key={st}
                        onClick={() => setNewStatus(st)}
                        className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition cursor-pointer ${
                          newStatus === st
                            ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* On-Site Verification Checklist */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  On-Site Diagnosis & Verification Checklist
                </label>
                <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkedChecklist.cabling}
                      onChange={(e) =>
                        setCheckedChecklist((prev) => ({ ...prev, cabling: e.target.checked }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Physical cabling, RJ45 crimps & waterproof glands inspected</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkedChecklist.poeVoltage}
                      onChange={(e) =>
                        setCheckedChecklist((prev) => ({ ...prev, poeVoltage: e.target.checked }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>PoE switch port voltage / injector power confirmed online</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkedChecklist.nvrStream}
                      onChange={(e) =>
                        setCheckedChecklist((prev) => ({ ...prev, nvrStream: e.target.checked }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Live video stream & bitrate verified on NVR channel</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkedChecklist.customerSignoff}
                      onChange={(e) =>
                        setCheckedChecklist((prev) => ({
                          ...prev,
                          customerSignoff: e.target.checked,
                        }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Customer POC verbally verified monitoring is restored</span>
                  </label>
                </div>
              </div>

              {/* Resolution Summary (Visible when status is Resolved) */}
              {newStatus === 'Resolved' && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 space-y-1">
                  <label className="block text-xs font-semibold text-emerald-900">
                    Resolution Summary (Root Cause & Corrective Action) *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Replaced water-damaged RJ45 connector on pole. Tested PoE power and live video stream restored to NVR channel 4. Verified with site manager."
                    value={resolutionSummary}
                    onChange={(e) => setResolutionSummary(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-emerald-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              )}

              {/* Work Log / Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Technician Activity Log / Work Note
                </label>
                <textarea
                  rows={3}
                  placeholder="Record what was tested, parts replaced, or next steps requested from client..."
                  value={workLogNote}
                  onChange={(e) => setWorkLogNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUpdatingTicket(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Save Progress & Update Status</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
