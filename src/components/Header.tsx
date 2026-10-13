import React, { useState } from 'react';
import {
  Network,
  ShieldAlert,
  Wrench,
  BarChart3,
  PlusCircle,
  RotateCcw,
  Info,
  Menu,
  X,
  UserCheck
} from 'lucide-react';
import { UserRole } from '../types/ticket';

interface HeaderProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  openTicketsCount: number;
  inProgressCount: number;
  onResetDemoData: () => void;
  onOpenRoadmap: () => void;
  onOpenNewTicket: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
  openTicketsCount,
  inProgressCount,
  onResetDemoData,
  onOpenRoadmap,
  onOpenNewTicket,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: UserRole; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'customer',
      label: 'Customer Portal',
      icon: <UserCheck className="w-4 h-4" />,
    },
    {
      id: 'admin',
      label: 'Admin Dashboard',
      icon: <ShieldAlert className="w-4 h-4" />,
      badge: openTicketsCount,
    },
    {
      id: 'engineer',
      label: 'Engineer Queue',
      icon: <Wrench className="w-4 h-4" />,
      badge: inProgressCount,
    },
    {
      id: 'stakeholder',
      label: 'Stakeholder View',
      icon: <BarChart3 className="w-4 h-4" />,
    },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      {/* Top Banner: Free-First & Standalone notice */}
      <div className="bg-slate-950 text-slate-300 text-xs py-1.5 px-4 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          <span className="font-medium text-slate-200">Local ₹0 Standalone Demonstration</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">
            Zero dependency on existing VMS / CCTV systems · No paid APIs · Browser storage active
          </span>
        </div>
        <div className="flex items-center gap-3 ml-auto text-xs">
          <button
            onClick={onResetDemoData}
            title="Reset sample data back to fresh demonstration state"
            className="text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
          <button
            onClick={onOpenRoadmap}
            className="text-sky-400 hover:text-sky-300 font-medium transition flex items-center gap-1 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Free-Tier Roadmap</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-white shadow-md border border-blue-400/30">
              <Network className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">Alpha Data Network</span>
                <span className="text-[10px] font-semibold bg-blue-900/80 text-blue-300 border border-blue-700/60 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  ADN Ticketing
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Surveillance & Enterprise Network Incident Portal
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
            {navItems.map((item) => {
              const isActive = currentRole === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectRole(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-blue-800 text-blue-100' : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenNewTicket}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">New Ticket</span>
              <span className="sm:hidden">Create</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-400 hover:text-white p-2 rounded-md focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const isActive = currentRole === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectRole(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-200">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
