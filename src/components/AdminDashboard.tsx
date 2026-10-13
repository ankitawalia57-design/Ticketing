import React, { useState, useMemo } from 'react';
import {
  Inbox,
  AlertTriangle,
  Clock,
  CheckCircle,
  Users,
  Search,
  Filter,
  Download,
  Eye,
  UserPlus,
  ArrowUpDown,
  Building,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Engineer, IssueCategory, Ticket, TicketPriority, TicketStatus } from '../types/ticket';
import { PriorityIndicator, StatusIndicator } from './StatusBadge';
import { assignTicketEngineer, updateTicketPriority, updateTicketStatus } from '../services/ticketStorage';

interface AdminDashboardProps {
  tickets: Ticket[];
  engineers: Engineer[];
  onOpenTicketDetails: (ticket: Ticket) => void;
  onRefresh: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  tickets,
  engineers,
  onOpenTicketDetails,
  onRefresh,
}) => {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [engineerFilter, setEngineerFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'createdAt' | 'priority' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // KPI Calculations
  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === 'Open').length;
    const inProgress = tickets.filter((t) => t.status === 'In Progress').length;
    const waiting = tickets.filter((t) => t.status === 'Waiting for Customer').length;
    const resolved = tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;
    const urgentHigh = tickets.filter(
      (t) => (t.priority === 'Urgent' || t.priority === 'High') && t.status !== 'Resolved' && t.status !== 'Closed'
    ).length;

    return { total, open, inProgress, waiting, resolved, urgentHigh };
  }, [tickets]);

  // Filtered & Sorted tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          ticket.id.toLowerCase().includes(q) ||
          ticket.customerName.toLowerCase().includes(q) ||
          ticket.companyName.toLowerCase().includes(q) ||
          ticket.siteAddress.toLowerCase().includes(q) ||
          ticket.description.toLowerCase().includes(q) ||
          ticket.category.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Status Filter
      if (statusFilter !== 'All' && ticket.status !== statusFilter) {
        return false;
      }

      // Priority Filter
      if (priorityFilter !== 'All' && ticket.priority !== priorityFilter) {
        return false;
      }

      // Category Filter
      if (categoryFilter !== 'All' && ticket.category !== categoryFilter) {
        return false;
      }

      // Engineer Filter
      if (engineerFilter !== 'All') {
        if (engineerFilter === 'unassigned') {
          if (ticket.assignedEngineerId) return false;
        } else if (ticket.assignedEngineerId !== engineerFilter) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'createdAt') {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      }
      if (sortBy === 'priority') {
        const priorityScore: Record<TicketPriority, number> = {
          Urgent: 4,
          High: 3,
          Medium: 2,
          Low: 1,
        };
        const scoreA = priorityScore[a.priority];
        const scoreB = priorityScore[b.priority];
        return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB;
      }
      return 0;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter, categoryFilter, engineerFilter, sortBy, sortOrder]);

  // Quick Action Handlers
  const handleAssignEngineer = (ticketId: string, engId: string) => {
    assignTicketEngineer(ticketId, engId === 'unassign' ? undefined : engId, 'ADN Admin');
    onRefresh();
  };

  const handleUpdateStatus = (ticketId: string, newStatus: TicketStatus) => {
    updateTicketStatus(ticketId, newStatus, 'ADN Admin', 'Admin');
    onRefresh();
  };

  const handleUpdatePriority = (ticketId: string, newPriority: TicketPriority) => {
    updateTicketPriority(ticketId, newPriority, 'ADN Admin');
    onRefresh();
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Ticket ID',
      'Created At',
      'Customer Name',
      'Company Name',
      'Phone',
      'Email',
      'Site Address',
      'Category',
      'Priority',
      'Status',
      'Assigned Engineer',
      'Description',
    ];

    const rows = filteredTickets.map((t) => [
      t.id,
      new Date(t.createdAt).toLocaleString(),
      `"${t.customerName.replace(/"/g, '""')}"`,
      `"${t.companyName.replace(/"/g, '""')}"`,
      t.phoneNumber,
      t.emailAddress,
      `"${t.siteAddress.replace(/"/g, '""')}"`,
      t.category,
      t.priority,
      t.status,
      t.assignedEngineerName || 'Unassigned',
      `"${t.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ADN_Tickets_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            NOC & Dispatch Administration
          </h1>
          <p className="text-sm text-slate-500">
            Real-time incident triage, field engineer dispatch, and ticket prioritization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Tickets</span>
            <Inbox className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <span className="text-[11px] text-slate-500">All recorded</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-xs font-medium">Open</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.open}</div>
          <span className="text-[11px] text-slate-500">Needs dispatch</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-blue-700 mb-1">
            <span className="text-xs font-medium">In Progress</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          <span className="text-[11px] text-slate-500">Active engineers</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-purple-700 mb-1">
            <span className="text-xs font-medium">Waiting Customer</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.waiting}</div>
          <span className="text-[11px] text-slate-500">Awaiting feedback</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-xs font-medium">Resolved</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{stats.resolved}</div>
          <span className="text-[11px] text-slate-500">Action completed</span>
        </div>

        <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between text-rose-800 mb-1">
            <span className="text-xs font-semibold">Urgent / High</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700">{stats.urgentHigh}</div>
          <span className="text-[11px] text-rose-600">Active high-priority</span>
        </div>
      </div>

      {/* Engineer Allocation Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Assigned Field Engineers & Real-Time Workload
            </h2>
          </div>
          <span className="text-xs text-slate-400">4 Active Specialists</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {engineers.map((eng) => (
            <div
              key={eng.id}
              className={`p-3 rounded-lg border text-xs transition ${
                eng.activeTicketsCount > 0
                  ? 'border-blue-200 bg-blue-50/40'
                  : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">{eng.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    eng.activeTicketsCount > 0
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {eng.activeTicketsCount} Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 truncate">{eng.role}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{eng.phone}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID, customer, company, address, issue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Waiting for Customer">Waiting for Customer</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Priority filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Engineer filter */}
          <div>
            <select
              value={engineerFilter}
              onChange={(e) => setEngineerFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="All">All Engineers</option>
              <option value="unassigned">Unassigned</option>
              {engineers.map((eng) => (
                <option key={eng.id} value={eng.id}>
                  {eng.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status filter pills / segmented buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Open', 'In Progress', 'Waiting for Customer', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <span>Showing {filteredTickets.length} of {tickets.length} tickets</span>
            {(searchQuery || statusFilter !== 'All' || priorityFilter !== 'All' || categoryFilter !== 'All' || engineerFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                  setPriorityFilter('All');
                  setCategoryFilter('All');
                  setEngineerFilter('All');
                }}
                className="text-blue-600 hover:underline font-medium cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Customer & Company</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Engineer</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-slate-600">No tickets found</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Try adjusting your search criteria or clear the filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-slate-50/80 transition group"
                  >
                    {/* Ticket ID */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-blue-700">
                          {ticket.id}
                        </span>
                        {ticket.isSampleData && (
                          <span
                            title="Sample Demonstration Record"
                            className="text-[9px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded font-normal"
                          >
                            Demo
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Customer & Company */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{ticket.customerName}</div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[160px]">{ticket.companyName}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-slate-800 font-medium">{ticket.category}</span>
                    </td>

                    {/* Priority (with inline changer) */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={ticket.priority}
                        onChange={(e) =>
                          handleUpdatePriority(ticket.id, e.target.value as TicketPriority)
                        }
                        className="bg-transparent border-0 text-xs focus:ring-1 focus:ring-blue-500 rounded p-0 cursor-pointer"
                        title="Click to modify priority"
                      >
                        <option value="Urgent">Urgent</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                      <div className="mt-0.5">
                        <PriorityIndicator priority={ticket.priority} />
                      </div>
                    </td>

                    {/* Status (with inline changer) */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={ticket.status}
                        onChange={(e) =>
                          handleUpdateStatus(ticket.id, e.target.value as TicketStatus)
                        }
                        className="bg-transparent border-0 text-xs focus:ring-1 focus:ring-blue-500 rounded p-0 cursor-pointer"
                        title="Click to update status"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Waiting for Customer">Waiting for Customer</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                      <div className="mt-0.5">
                        <StatusIndicator status={ticket.status} />
                      </div>
                    </td>

                    {/* Assigned Engineer (with inline dispatcher) */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={ticket.assignedEngineerId || 'unassign'}
                        onChange={(e) => handleAssignEngineer(ticket.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded border focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${
                          ticket.assignedEngineerId
                            ? 'border-blue-200 bg-blue-50/50 text-blue-900 font-medium'
                            : 'border-amber-300 bg-amber-50 text-amber-800'
                        }`}
                      >
                        <option value="unassign">-- Unassigned --</option>
                        {engineers.map((eng) => (
                          <option key={eng.id} value={eng.id}>
                            {eng.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                      <div>{new Date(ticket.createdAt).toLocaleDateString()}</div>
                      <div className="text-slate-400">
                        {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => onOpenTicketDetails(ticket)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-medium rounded transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
