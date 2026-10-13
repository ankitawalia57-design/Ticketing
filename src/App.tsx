import React, { useState, useEffect, useCallback } from 'react';
import {
  getEngineers,
  getStoredTickets,
  resetDemoData,
} from './services/ticketStorage';
import { Engineer, Ticket, UserRole } from './types/ticket';
import { Header } from './components/Header';
import { CustomerPortal } from './components/CustomerPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { EngineerPortal } from './components/EngineerPortal';
import { StakeholderView } from './components/StakeholderView';
import { TicketDetailModal } from './components/TicketDetailModal';
import { FreeTierRoadmapModal } from './components/FreeTierRoadmapModal';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  Shield,
  HelpCircle,
  Network,
} from 'lucide-react';

export default function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [selectedTicketForModal, setSelectedTicketForModal] = useState<Ticket | null>(null);
  const [preselectedTicketId, setPreselectedTicketId] = useState<string | null>(null);
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  // Load tickets & engineers
  const loadData = useCallback(() => {
    const loadedTickets = getStoredTickets();
    const loadedEngineers = getEngineers();
    setTickets(loadedTickets);
    setEngineers(loadedEngineers);

    // If modal is open, refresh the selected ticket instance
    if (selectedTicketForModal) {
      const refreshed = loadedTickets.find((t) => t.id === selectedTicketForModal.id);
      if (refreshed) setSelectedTicketForModal(refreshed);
    }
  }, [selectedTicketForModal]);

  useEffect(() => {
    loadData();

    // Listen to custom update events across tabs/components
    const handleStorageChange = () => loadData();
    window.addEventListener('adn_tickets_updated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('adn_tickets_updated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadData]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleTicketCreated = (newTicket: Ticket) => {
    loadData();
    showToast(`Ticket ${newTicket.id} created successfully!`, 'success');
  };

  const handleResetDemoData = () => {
    resetDemoData();
    loadData();
    showToast('Demo tickets and engineers reset to initial sample data.', 'info');
  };

  const handleOpenTicketDetails = (ticket: Ticket) => {
    setSelectedTicketForModal(ticket);
  };

  // Open ticket submission
  const handleOpenNewTicket = () => {
    setCurrentRole('customer');
    setPreselectedTicketId(null);
  };

  const openTicketsCount = tickets.filter((t) => t.status === 'Open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200 bg-white border-slate-200 text-slate-800">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentRole={currentRole}
        onSelectRole={(role) => setCurrentRole(role)}
        openTicketsCount={openTicketsCount}
        inProgressCount={inProgressCount}
        onResetDemoData={handleResetDemoData}
        onOpenRoadmap={() => setIsRoadmapOpen(true)}
        onOpenNewTicket={handleOpenNewTicket}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentRole === 'customer' && (
          <CustomerPortal
            tickets={tickets}
            onTicketCreated={handleTicketCreated}
            onOpenTicketDetails={handleOpenTicketDetails}
            preselectedTicketId={preselectedTicketId}
          />
        )}

        {currentRole === 'admin' && (
          <AdminDashboard
            tickets={tickets}
            engineers={engineers}
            onOpenTicketDetails={handleOpenTicketDetails}
            onRefresh={loadData}
          />
        )}

        {currentRole === 'engineer' && (
          <EngineerPortal
            tickets={tickets}
            engineers={engineers}
            onOpenTicketDetails={handleOpenTicketDetails}
            onRefresh={loadData}
          />
        )}

        {currentRole === 'stakeholder' && (
          <StakeholderView
            tickets={tickets}
            onOpenTicketDetails={handleOpenTicketDetails}
          />
        )}
      </main>

      {/* Ticket Details Inspection Modal */}
      <TicketDetailModal
        ticket={selectedTicketForModal}
        onClose={() => setSelectedTicketForModal(null)}
        currentRole={currentRole}
        onRefresh={loadData}
      />

      {/* Free Tier Architecture Roadmap Modal */}
      <FreeTierRoadmapModal
        isOpen={isRoadmapOpen}
        onClose={() => setIsRoadmapOpen(false)}
      />

      {/* Professional Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center">
                <Network className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <span className="font-bold text-white text-sm">
                  Alpha Data Network (ADN)
                </span>
                <p className="text-[11px] text-slate-400">
                  Surveillance Infrastructure & Incident Management Portal · Standalone ₹0 Edition
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
              <button
                onClick={() => setIsRoadmapOpen(true)}
                className="hover:text-sky-300 transition cursor-pointer flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>₹0 Free-Tier Guide</span>
              </button>
              <span>·</span>
              <button
                onClick={handleResetDemoData}
                className="hover:text-white transition cursor-pointer"
              >
                Reset Demo Sample Data
              </button>
              <span>·</span>
              <span className="text-slate-500">
                100% Isolated from existing VMS/CCTV system
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
            © {new Date().getFullYear()} Alpha Data Network. Standalone deployment. All client data held locally in browser demonstration state.
          </div>
        </div>
      </footer>
    </div>
  );
}
