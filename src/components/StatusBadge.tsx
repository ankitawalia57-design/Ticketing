import React from 'react';
import { TicketPriority, TicketStatus } from '../types/ticket';

export const StatusIndicator: React.FC<{ status: TicketStatus }> = ({ status }) => {
  switch (status) {
    case 'Open':
      return (
        <span className="inline-flex items-center gap-1.5 font-medium text-xs text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Open
        </span>
      );
    case 'In Progress':
      return (
        <span className="inline-flex items-center gap-1.5 font-medium text-xs text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          In Progress
        </span>
      );
    case 'Waiting for Customer':
      return (
        <span className="inline-flex items-center gap-1.5 font-medium text-xs text-purple-700 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          Waiting for Customer
        </span>
      );
    case 'Resolved':
      return (
        <span className="inline-flex items-center gap-1.5 font-medium text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          Resolved
        </span>
      );
    case 'Closed':
      return (
        <span className="inline-flex items-center gap-1.5 font-medium text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          Closed
        </span>
      );
    default:
      return <span className="text-xs text-slate-600">{status}</span>;
  }
};

export const PriorityIndicator: React.FC<{ priority: TicketPriority }> = ({ priority }) => {
  switch (priority) {
    case 'Urgent':
      return (
        <span className="inline-flex items-center gap-1 font-semibold text-xs text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
          Urgent
        </span>
      );
    case 'High':
      return (
        <span className="inline-flex items-center gap-1 font-medium text-xs text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          High
        </span>
      );
    case 'Medium':
      return (
        <span className="inline-flex items-center gap-1 font-medium text-xs text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
          Medium
        </span>
      );
    case 'Low':
      return (
        <span className="inline-flex items-center gap-1 font-normal text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
          Low
        </span>
      );
  }
};
