export type IssueCategory =
  | 'Camera Offline'
  | 'No Live Video'
  | 'CCTV Monitoring Issue'
  | 'Installation Request'
  | 'Billing/Account'
  | 'Other';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type TicketStatus =
  | 'Open'
  | 'In Progress'
  | 'Waiting for Customer'
  | 'Resolved'
  | 'Closed';

export interface Engineer {
  id: string;
  name: string;
  role: string;
  phone: string;
  activeTicketsCount: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  author: string;
  role: 'Customer' | 'Admin' | 'Engineer' | 'System';
  message: string;
  type: 'status_change' | 'note' | 'assignment' | 'created';
}

export interface TicketAttachment {
  name: string;
  size: number;
  type: string;
  dataUrl?: string; // Preview for images
}

export interface Ticket {
  id: string; // ADN-YYYY-000001
  customerName: string;
  companyName: string;
  phoneNumber: string;
  emailAddress: string;
  siteAddress: string;
  category: IssueCategory;
  priority: TicketPriority;
  description: string;
  attachment?: TicketAttachment;
  status: TicketStatus;
  assignedEngineerId?: string;
  assignedEngineerName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolutionSummary?: string;
  activityLogs: ActivityLog[];
  isSampleData?: boolean;
}

export type UserRole = 'customer' | 'admin' | 'engineer' | 'stakeholder';
