import { INITIAL_ENGINEERS, INITIAL_SAMPLE_TICKETS } from '../data/initialTickets';
import { ActivityLog, Engineer, IssueCategory, Ticket, TicketAttachment, TicketPriority, TicketStatus } from '../types/ticket';

const STORAGE_KEY = 'adn_tickets_v1';
const ENGINEERS_STORAGE_KEY = 'adn_engineers_v1';

export function getStoredTickets(): Ticket[] {
  if (typeof window === 'undefined') return INITIAL_SAMPLE_TICKETS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_TICKETS));
      return INITIAL_SAMPLE_TICKETS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse tickets from localStorage:', err);
    return INITIAL_SAMPLE_TICKETS;
  }
}

export function saveStoredTickets(tickets: Ticket[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    window.dispatchEvent(new Event('adn_tickets_updated'));
  } catch (err) {
    console.error('Failed to save tickets to localStorage:', err);
  }
}

export function getEngineers(): Engineer[] {
  if (typeof window === 'undefined') return INITIAL_ENGINEERS;
  try {
    const raw = localStorage.getItem(ENGINEERS_STORAGE_KEY);
    const engineers: Engineer[] = raw ? JSON.parse(raw) : INITIAL_ENGINEERS;
    
    // Recalculate active tickets count based on current tickets
    const tickets = getStoredTickets();
    return engineers.map((eng) => {
      const activeCount = tickets.filter(
        (t) => t.assignedEngineerId === eng.id && t.status !== 'Resolved' && t.status !== 'Closed'
      ).length;
      return { ...eng, activeTicketsCount: activeCount };
    });
  } catch {
    return INITIAL_ENGINEERS;
  }
}

export function resetDemoData(): Ticket[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_TICKETS));
    localStorage.setItem(ENGINEERS_STORAGE_KEY, JSON.stringify(INITIAL_ENGINEERS));
    window.dispatchEvent(new Event('adn_tickets_updated'));
  }
  return INITIAL_SAMPLE_TICKETS;
}

export function generateNextTicketId(existingTickets: Ticket[]): string {
  const currentYear = new Date().getFullYear();
  const prefix = `ADN-${currentYear}-`;

  let maxSequence = 0;
  for (const t of existingTickets) {
    if (t.id.startsWith(prefix)) {
      const seqPart = t.id.replace(prefix, '');
      const parsed = parseInt(seqPart, 10);
      if (!isNaN(parsed) && parsed > maxSequence) {
        maxSequence = parsed;
      }
    } else if (t.id.startsWith('ADN-')) {
      // Handles year differences or initial samples
      const parts = t.id.split('-');
      if (parts.length === 3) {
        const parsed = parseInt(parts[2], 10);
        if (!isNaN(parsed) && parsed > maxSequence) {
          maxSequence = parsed;
        }
      }
    }
  }

  const nextSeq = maxSequence + 1;
  const padded = String(nextSeq).padStart(6, '0');
  return `${prefix}${padded}`;
}

export interface CreateTicketParams {
  customerName: string;
  companyName: string;
  phoneNumber: string;
  emailAddress: string;
  siteAddress: string;
  category: IssueCategory;
  priority: TicketPriority;
  description: string;
  attachment?: TicketAttachment;
}

export function createTicket(params: CreateTicketParams): Ticket {
  const existing = getStoredTickets();
  const newId = generateNextTicketId(existing);
  const now = new Date().toISOString();

  const initialLog: ActivityLog = {
    id: `act-${Date.now()}-1`,
    timestamp: now,
    author: params.customerName,
    role: 'Customer',
    message: `Ticket submitted via Customer Portal. Priority marked as ${params.priority}.`,
    type: 'created',
  };

  const newTicket: Ticket = {
    id: newId,
    customerName: params.customerName.trim(),
    companyName: params.companyName.trim(),
    phoneNumber: params.phoneNumber.trim(),
    emailAddress: params.emailAddress.trim(),
    siteAddress: params.siteAddress.trim(),
    category: params.category,
    priority: params.priority,
    description: params.description.trim(),
    attachment: params.attachment,
    status: 'Open',
    createdAt: now,
    updatedAt: now,
    activityLogs: [initialLog],
    isSampleData: false,
  };

  const updatedTickets = [newTicket, ...existing];
  saveStoredTickets(updatedTickets);
  return newTicket;
}

export function updateTicketStatus(
  ticketId: string,
  newStatus: TicketStatus,
  authorName: string,
  authorRole: 'Admin' | 'Engineer' | 'Customer',
  notes?: string,
  resolutionSummary?: string
): Ticket | null {
  const tickets = getStoredTickets();
  const index = tickets.findIndex((t) => t.id === ticketId);
  if (index === -1) return null;

  const current = tickets[index];
  const now = new Date().toISOString();

  let message = `Status updated from "${current.status}" to "${newStatus}".`;
  if (notes && notes.trim()) {
    message += ` Note: ${notes.trim()}`;
  }

  const log: ActivityLog = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    author: authorName,
    role: authorRole,
    message,
    type: 'status_change',
  };

  const updated: Ticket = {
    ...current,
    status: newStatus,
    updatedAt: now,
    resolvedAt: newStatus === 'Resolved' ? now : current.resolvedAt,
    resolutionSummary: resolutionSummary ? resolutionSummary.trim() : current.resolutionSummary,
    activityLogs: [...current.activityLogs, log],
  };

  tickets[index] = updated;
  saveStoredTickets(tickets);
  return updated;
}

export function assignTicketEngineer(
  ticketId: string,
  engineerId: string | undefined,
  adminName: string
): Ticket | null {
  const tickets = getStoredTickets();
  const index = tickets.findIndex((t) => t.id === ticketId);
  if (index === -1) return null;

  const current = tickets[index];
  const engineers = getEngineers();
  const engineer = engineers.find((e) => e.id === engineerId);
  const now = new Date().toISOString();

  const engineerName = engineer ? engineer.name : undefined;
  const message = engineerName
    ? `Assigned to ${engineerName} (${engineer?.role}).`
    : `Engineer assignment cleared.`;

  const log: ActivityLog = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    author: adminName,
    role: 'Admin',
    message,
    type: 'assignment',
  };

  const updated: Ticket = {
    ...current,
    assignedEngineerId: engineerId || undefined,
    assignedEngineerName: engineerName,
    status: current.status === 'Open' && engineerId ? 'In Progress' : current.status,
    updatedAt: now,
    activityLogs: [...current.activityLogs, log],
  };

  tickets[index] = updated;
  saveStoredTickets(tickets);
  return updated;
}

export function updateTicketPriority(
  ticketId: string,
  newPriority: TicketPriority,
  adminName: string
): Ticket | null {
  const tickets = getStoredTickets();
  const index = tickets.findIndex((t) => t.id === ticketId);
  if (index === -1) return null;

  const current = tickets[index];
  const now = new Date().toISOString();

  const log: ActivityLog = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    author: adminName,
    role: 'Admin',
    message: `Priority changed from ${current.priority} to ${newPriority}.`,
    type: 'note',
  };

  const updated: Ticket = {
    ...current,
    priority: newPriority,
    updatedAt: now,
    activityLogs: [...current.activityLogs, log],
  };

  tickets[index] = updated;
  saveStoredTickets(tickets);
  return updated;
}

export function addTicketNote(
  ticketId: string,
  authorName: string,
  role: 'Customer' | 'Admin' | 'Engineer',
  noteText: string
): Ticket | null {
  const tickets = getStoredTickets();
  const index = tickets.findIndex((t) => t.id === ticketId);
  if (index === -1) return null;

  const current = tickets[index];
  const now = new Date().toISOString();

  const log: ActivityLog = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    author: authorName,
    role,
    message: noteText.trim(),
    type: 'note',
  };

  const updated: Ticket = {
    ...current,
    updatedAt: now,
    activityLogs: [...current.activityLogs, log],
  };

  tickets[index] = updated;
  saveStoredTickets(tickets);
  return updated;
}
