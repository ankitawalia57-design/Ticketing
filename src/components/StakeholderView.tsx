import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Building2,
  PieChart,
  Search,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { IssueCategory, Ticket, TicketPriority } from '../types/ticket';
import { PriorityIndicator, StatusIndicator } from './StatusBadge';

interface StakeholderViewProps {
  tickets: Ticket[];
  onOpenTicketDetails: (ticket: Ticket) => void;
}

export const StakeholderView: React.FC<StakeholderViewProps> = ({
  tickets,
  onOpenTicketDetails,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Executive Metrics
  const metrics = useMemo(() => {
    const total = tickets.length;
    const resolved = tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;
    const open = tickets.filter((t) => t.status === 'Open').length;
    const inProgress = tickets.filter((t) => t.status === 'In Progress').length;
    const urgent = tickets.filter((t) => t.priority === 'Urgent').length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;

    // Unique clients
    const uniqueClients = new Set(tickets.map((t) => t.companyName)).size;

    return { total, resolved, open, inProgress, urgent, resolutionRate, uniqueClients };
  }, [tickets]);

  // Category Distribution
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of tickets) {
      counts[t.category] = (counts[t.category] || 0) + 1;
    }
    return counts;
  }, [tickets]);

  // Priority Distribution
  const priorityCounts = useMemo(() => {
    const counts: Record<TicketPriority, number> = {
      Urgent: 0,
      High: 0,
      Medium: 0,
      Low: 0,
    };
    for (const t of tickets) {
      counts[t.priority] = (counts[t.priority] || 0) + 1;
    }
    return counts;
  }, [tickets]);

  // Search filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          t.id.toLowerCase().includes(q) ||
          t.companyName.toLowerCase().includes(q) ||
          t.siteAddress.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tickets, searchQuery, categoryFilter]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Stakeholder & Executive Overview
          </h1>
          <p className="text-sm text-slate-500">
            High-level surveillance SLA metrics, root-cause distribution, and audit summaries.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition shadow-xs cursor-pointer"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>Print Executive Summary</span>
        </button>
      </div>

      {/* Top Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Resolution Efficiency
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {metrics.resolutionRate}%
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {metrics.resolved} of {metrics.total} total tickets resolved
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.resolutionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Current Active Pipeline
            </span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-blue-700">
            {metrics.open + metrics.inProgress}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {metrics.open} Open awaiting triage · {metrics.inProgress} In Field
          </p>
          <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>NOC response within standard SLA thresholds</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Critical & Urgent Outages
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-rose-700">{metrics.urgent}</div>
          <p className="text-xs text-slate-500 mt-1">
            High-severity surveillance perimeter alerts
          </p>
          <div className="flex items-center gap-2 mt-3 text-[11px] text-rose-700 font-medium">
            <span>Priority dispatch target: &lt; 2 hours</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Active Client Facilities
            </span>
            <Building2 className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {metrics.uniqueClients}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Covering commercial warehouses, corporate towers & sites
          </p>
          <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>All monitored under Alpha Data Network</span>
          </div>
        </div>
      </div>

      {/* Analytics Breakdown Row: Categories & Priorities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Incidents by Category
              </h2>
            </div>
            <span className="text-xs text-slate-400">Total {tickets.length}</span>
          </div>

          <div className="space-y-3">
            {(
              [
                'Camera Offline',
                'No Live Video',
                'CCTV Monitoring Issue',
                'Installation Request',
                'Billing/Account',
                'Other',
              ] as IssueCategory[]
            ).map((cat) => {
              const count = categoryCounts[cat] || 0;
              const pct = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{cat}</span>
                    <span className="text-slate-500 font-semibold">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown & SLA Guidelines */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Severity & SLA Compliance Targets
              </h2>
            </div>
            <span className="text-xs text-slate-400">ADN Standard</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/50 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-rose-900 block">Urgent Priority (Critical)</span>
                <span className="text-rose-700 text-[11px]">
                  Target Resolution: Within 2 hours
                </span>
              </div>
              <span className="text-base font-extrabold text-rose-800">
                {priorityCounts.Urgent}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-orange-200 bg-orange-50/50 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-orange-900 block">High Priority</span>
                <span className="text-orange-700 text-[11px]">
                  Target Resolution: Within 4 hours
                </span>
              </div>
              <span className="text-base font-extrabold text-orange-800">
                {priorityCounts.High}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-blue-900 block">Medium Priority</span>
                <span className="text-orange-700 text-[11px] text-blue-700">
                  Target Resolution: Within 8 hours
                </span>
              </div>
              <span className="text-base font-extrabold text-blue-800">
                {priorityCounts.Medium}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800 block">Low Priority</span>
                <span className="text-slate-500 text-[11px]">
                  Target Resolution: Within 24 hours
                </span>
              </div>
              <span className="text-base font-extrabold text-slate-700">
                {priorityCounts.Low}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Read-Only Incident Audit Ledger */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Incident Audit Trail (Read-Only)
            </h2>
            <p className="text-xs text-slate-500">
              Complete stakeholder visibility into all logged events, technician assignments, and resolution notes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter audit log..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">Organization & Site</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Assigned Lead</th>
                <th className="py-2.5 px-3">Resolution Summary</th>
                <th className="py-2.5 px-3 text-right">View Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                    {t.id}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-800">{t.companyName}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs">{t.siteAddress}</div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">{t.category}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <PriorityIndicator priority={t.priority} />
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <StatusIndicator status={t.status} />
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                    {t.assignedEngineerName || <span className="text-slate-400 italic">Unassigned</span>}
                  </td>
                  <td className="py-2.5 px-3 max-w-xs truncate text-slate-600 text-[11px]">
                    {t.resolutionSummary || (
                      <span className="text-slate-400 italic">In progress / pending resolution</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => onOpenTicketDetails(t)}
                      className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition cursor-pointer"
                      title="Inspect full timeline"
                    >
                      <Eye className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
