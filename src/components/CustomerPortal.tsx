import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  Paperclip,
  X,
  FileText,
  AlertCircle,
  Copy,
  Check,
  Search,
  Clock,
  Building,
  MapPin,
  Phone,
  Mail,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import {
  CreateTicketParams,
  createTicket,
  addTicketNote,
} from '../services/ticketStorage';
import {
  IssueCategory,
  Ticket,
  TicketAttachment,
  TicketPriority,
} from '../types/ticket';
import { PriorityIndicator, StatusIndicator } from './StatusBadge';

const ISSUE_CATEGORIES: { value: IssueCategory; description: string }[] = [
  { value: 'Camera Offline', description: 'Camera power down, disconnected, or link lost' },
  { value: 'No Live Video', description: 'Black screen, frozen image, or decoding failure' },
  { value: 'CCTV Monitoring Issue', description: 'NVR stuttering, packet drops, or viewer lag' },
  { value: 'Installation Request', description: 'New camera point, rewiring, or site expansion' },
  { value: 'Billing/Account', description: 'AMC contract, invoice, or licensing query' },
  { value: 'Other', description: 'General surveillance or network assistance' },
];

const PRIORITIES: {
  value: TicketPriority;
  label: string;
  sla: string;
  desc: string;
  badgeClass: string;
}[] = [
  {
    value: 'Urgent',
    label: 'Urgent',
    sla: '< 2 Hours SLA',
    desc: 'Critical security perimeter or total live feed outage',
    badgeClass: 'border-rose-300 text-rose-800 bg-rose-50',
  },
  {
    value: 'High',
    label: 'High',
    sla: '< 4 Hours SLA',
    desc: 'Single primary camera failure or significant monitoring loss',
    badgeClass: 'border-orange-300 text-orange-800 bg-orange-50',
  },
  {
    value: 'Medium',
    label: 'Medium',
    sla: '< 8 Hours SLA',
    desc: 'Minor latency, quality degradation, or non-critical camera',
    badgeClass: 'border-blue-300 text-blue-800 bg-blue-50',
  },
  {
    value: 'Low',
    label: 'Low',
    sla: '< 24 Hours SLA',
    desc: 'General inquiry, site survey, or routine preventive request',
    badgeClass: 'border-slate-300 text-slate-700 bg-slate-50',
  },
];

interface CustomerPortalProps {
  tickets: Ticket[];
  onTicketCreated: (newTicket: Ticket) => void;
  onOpenTicketDetails?: (ticket: Ticket) => void;
  preselectedTicketId?: string | null;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  tickets,
  onTicketCreated,
  onOpenTicketDetails,
  preselectedTicketId,
}) => {
  const [activeTab, setActiveTab] = useState<'submit' | 'confirmation' | 'lookup'>(
    preselectedTicketId ? 'lookup' : 'submit'
  );

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [category, setCategory] = useState<IssueCategory>('Camera Offline');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState<TicketAttachment | undefined>(undefined);

  // Validation & Submission States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestCreatedTicket, setLatestCreatedTicket] = useState<Ticket | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Lookup state
  const [searchQuery, setSearchQuery] = useState(preselectedTicketId || '');
  const [searchedTicket, setSearchedTicket] = useState<Ticket | null>(
    preselectedTicketId ? tickets.find((t) => t.id === preselectedTicketId) || null : null
  );
  const [lookupMessage, setLookupMessage] = useState('');
  const [customerNote, setCustomerNote] = useState('');

  // Handle Attachment selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, attachment: 'File size must be under 5MB.' }));
      return;
    }

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.attachment;
      return copy;
    });

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachment({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: event.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    setAttachment(undefined);
  };

  // Form Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!customerName.trim()) newErrors.customerName = 'Customer name is required.';
    if (!companyName.trim()) newErrors.companyName = 'Company name is required.';
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required.';
    } else if (!/^[0-9+() -]{7,16}$/.test(phoneNumber.trim())) {
      newErrors.phoneNumber = 'Please enter a valid phone number.';
    }

    if (!emailAddress.trim()) {
      newErrors.emailAddress = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress.trim())) {
      newErrors.emailAddress = 'Please enter a valid email address.';
    }

    if (!siteAddress.trim()) newErrors.siteAddress = 'Site installation/office address is required.';
    if (!description.trim()) {
      newErrors.description = 'Please describe the issue or request.';
    } else if (description.trim().length < 15) {
      newErrors.description = 'Please provide at least 15 characters describing the problem.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const params: CreateTicketParams = {
        customerName,
        companyName,
        phoneNumber,
        emailAddress,
        siteAddress,
        category,
        priority,
        description,
        attachment,
      };

      const created = createTicket(params);
      onTicketCreated(created);
      setLatestCreatedTicket(created);
      setIsSubmitting(false);
      setActiveTab('confirmation');

      // Clear form
      setCustomerName('');
      setCompanyName('');
      setPhoneNumber('');
      setEmailAddress('');
      setSiteAddress('');
      setDescription('');
      setAttachment(undefined);
      setErrors({});
    }, 400);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleLookup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setLookupMessage('Please enter your Ticket ID (e.g., ADN-2026-000001) or Email Address.');
      setSearchedTicket(null);
      return;
    }

    const found = tickets.find(
      (t) =>
        t.id.toLowerCase() === query ||
        t.emailAddress.toLowerCase() === query ||
        t.phoneNumber.replace(/\s+/g, '') === query.replace(/\s+/g, '')
    );

    if (found) {
      setSearchedTicket(found);
      setLookupMessage('');
    } else {
      setSearchedTicket(null);
      setLookupMessage(`No ticket found matching "${searchQuery}". Please check the ID or email.`);
    }
  };

  const handleAddCustomerNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerNote.trim() || !searchedTicket) return;

    const updated = addTicketNote(
      searchedTicket.id,
      searchedTicket.customerName,
      'Customer',
      customerNote
    );
    if (updated) {
      setSearchedTicket(updated);
      setCustomerNote('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Mode navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Customer Support Portal
          </h1>
          <p className="text-sm text-slate-500">
            Submit a new CCTV or network incident, or track ongoing tickets.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('submit')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
              activeTab === 'submit'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Submit New Ticket
          </button>
          <button
            onClick={() => setActiveTab('lookup')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
              activeTab === 'lookup'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Track Existing Ticket
          </button>
        </div>
      </div>

      {/* TAB 1: SUBMISSION FORM */}
      {activeTab === 'submit' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              New Technical Support Request
            </h2>
            <p className="text-xs text-slate-500">
              Fill out this form to notify our ADN NOC and field dispatch team. All fields marked with * are required.
            </p>
          </div>

          {/* Section: Customer & Company Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Contact & Organization Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sanjay Deshmukh"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.customerName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.customerName && (
                  <p className="text-xs text-rose-600 mt-1">{errors.customerName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Company / Organization Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Logistics Hub"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.companyName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.companyName && (
                  <p className="text-xs text-rose-600 mt-1">{errors.companyName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Phone Number (for Engineer dispatch calls) *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98220 11984"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phoneNumber ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.phoneNumber && (
                  <p className="text-xs text-rose-600 mt-1">{errors.phoneNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="e.g. support@apexlogistics.in"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.emailAddress ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.emailAddress && (
                  <p className="text-xs text-rose-600 mt-1">{errors.emailAddress}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Site Installation Address *
              </label>
              <input
                type="text"
                placeholder="e.g. Warehouse Block 4, Gate B, Bhiwandi Logistics Corridor, Mumbai"
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.siteAddress ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.siteAddress && (
                <p className="text-xs text-rose-600 mt-1">{errors.siteAddress}</p>
              )}
            </div>
          </div>

          {/* Section: Incident Classification */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Incident Classification & Severity
            </h3>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Issue Category *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {ISSUE_CATEGORIES.map((cat) => {
                  const isSelected = category === cat.value;
                  return (
                    <button
                      type="button"
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`text-left p-3 rounded-lg border transition cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-500'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="font-medium text-xs text-slate-900">{cat.value}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {cat.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority selection */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Priority Level *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                {PRIORITIES.map((p) => {
                  const isSelected = priority === p.value;
                  return (
                    <button
                      type="button"
                      key={p.value}
                      onClick={() => setPriority(p.value)}
                      className={`text-left p-3 rounded-lg border transition cursor-pointer ${
                        isSelected
                          ? `${p.badgeClass} ring-1 ring-current`
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs">{p.label}</span>
                        <span className="text-[10px] font-medium">{p.sla}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1 leading-tight">
                        {p.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section: Description & Attachment */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              3. Problem Description & Evidence
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Issue Description *
              </label>
              <textarea
                rows={4}
                placeholder="Provide detailed information: Camera channel/number, pole location, time noticed, whether switch lights are blinking, error messages on the screen, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                <span>Min 15 characters</span>
                <span>{description.length} chars</span>
              </div>
              {errors.description && (
                <p className="text-xs text-rose-600 mt-1">{errors.description}</p>
              )}
            </div>

            {/* Optional Attachment */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Optional Attachment (Screenshot, Site Photo, or Diagram - Max 5MB)
              </label>

              {!attachment ? (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-5 cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition">
                  <Paperclip className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-medium text-slate-700">
                    Click to browse or drag file here
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Supports JPG, PNG, PDF, or TXT
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,.txt,.doc,.docx"
                    onChange={handleFileChange}
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {attachment.dataUrl?.startsWith('data:image/') ? (
                      <img
                        src={attachment.dataUrl}
                        alt="attachment preview"
                        className="w-10 h-10 object-cover rounded border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">
                        {attachment.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {(attachment.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeAttachment}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="Remove attachment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {errors.attachment && (
                <p className="text-xs text-rose-600 mt-1">{errors.attachment}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Standard ADN incident protocol: Ticket generated as ADN-YYYY-XXXXXX and logged.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Ticket...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Support Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: CONFIRMATION SCREEN */}
      {activeTab === 'confirmation' && latestCreatedTicket && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Header Banner */}
          <div className="text-center pb-6 border-b border-slate-100">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Support Ticket Successfully Created!
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Your incident report has been received and queued in the Alpha Data Network dispatch system.
            </p>

            {/* Prominent Ticket ID Card */}
            <div className="mt-5 inline-flex flex-col sm:flex-row items-center gap-3 bg-slate-50 border border-slate-200 px-5 py-3 rounded-xl">
              <div>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">
                  Your Official Ticket ID
                </span>
                <span className="text-2xl font-extrabold text-blue-700 font-mono tracking-wider">
                  {latestCreatedTicket.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(latestCreatedTicket.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100 transition shadow-xs cursor-pointer"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Ticket Summary Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-xs font-medium text-slate-500">Customer & Organization</span>
              <p className="text-sm font-semibold text-slate-900">
                {latestCreatedTicket.customerName}
              </p>
              <p className="text-xs text-slate-600">{latestCreatedTicket.companyName}</p>
              <div className="mt-2 text-xs text-slate-600 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {latestCreatedTicket.phoneNumber}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {latestCreatedTicket.emailAddress}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-slate-500">Classification & SLA</span>
              <div className="flex items-center gap-2 mt-1">
                <StatusIndicator status={latestCreatedTicket.status} />
                <PriorityIndicator priority={latestCreatedTicket.priority} />
              </div>
              <p className="text-xs text-slate-700 mt-2 font-medium">
                Category: <span className="font-normal">{latestCreatedTicket.category}</span>
              </p>
              <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{latestCreatedTicket.siteAddress}</span>
              </p>
            </div>
          </div>

          {/* Description Preview */}
          <div className="p-4 rounded-lg bg-white border border-slate-200">
            <span className="text-xs font-medium text-slate-500 block mb-1">
              Issue Summary Submitted:
            </span>
            <p className="text-xs text-slate-800 whitespace-pre-wrap">
              {latestCreatedTicket.description}
            </p>
            {latestCreatedTicket.attachment && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                <span>Attachment: {latestCreatedTicket.attachment.name}</span>
                <span className="text-slate-400">
                  ({(latestCreatedTicket.attachment.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            )}
          </div>

          {/* Workflow Next Steps Info */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-4 text-xs text-blue-900 space-y-1.5">
            <h4 className="font-semibold text-blue-950 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-700" />
              What Happens Next:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-blue-800 text-xs">
              <li>Our NOC dispatch desk will assign the nearest field technician or engineer.</li>
              <li>You will receive live status updates directly on this portal.</li>
              <li>
                For urgent emergencies, you can quote ticket ID <strong>{latestCreatedTicket.id}</strong> on phone calls.
              </li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={() => {
                setSearchedTicket(latestCreatedTicket);
                setSearchQuery(latestCreatedTicket.id);
                setActiveTab('lookup');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-xs transition cursor-pointer"
            >
              Track This Ticket Now
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium px-4 py-2 rounded-lg text-xs transition cursor-pointer"
            >
              Submit Another Support Ticket
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: TRACK EXISTING TICKET */}
      {activeTab === 'lookup' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Track Support Ticket Status
            </h2>
            <p className="text-xs text-slate-500">
              Enter your ADN Ticket ID or registered Email Address to inspect real-time progress.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleLookup} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="e.g. ADN-2026-000001 or email@domain.com"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg text-xs transition cursor-pointer shrink-0"
            >
              Search Ticket
            </button>
          </form>

          {lookupMessage && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{lookupMessage}</span>
            </div>
          )}

          {/* Display Searched Ticket */}
          {searchedTicket ? (
            <div className="space-y-5 border-t border-slate-100 pt-5">
              {/* Header Box */}
              <div className="flex flex-wrap items-start justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-blue-700">
                      {searchedTicket.id}
                    </span>
                    {searchedTicket.isSampleData && (
                      <span className="text-[10px] bg-slate-200 text-slate-700 font-medium px-1.5 py-0.5 rounded">
                        Sample Demo Ticket
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mt-1">
                    {searchedTicket.category} · {searchedTicket.companyName}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {searchedTicket.siteAddress}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-2">
                    <StatusIndicator status={searchedTicket.status} />
                    <PriorityIndicator priority={searchedTicket.priority} />
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Logged: {new Date(searchedTicket.createdAt).toLocaleDateString()} at{' '}
                    {new Date(searchedTicket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Status & Assignment Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="text-slate-500 font-medium block mb-1">
                    Assigned Field Engineer:
                  </span>
                  {searchedTicket.assignedEngineerName ? (
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {searchedTicket.assignedEngineerName}
                    </div>
                  ) : (
                    <span className="text-amber-700 font-medium">
                      Pending Dispatch Assignment
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="text-slate-500 font-medium block mb-1">
                    Current Resolution Status:
                  </span>
                  <div className="font-medium text-slate-800">
                    {searchedTicket.status === 'Resolved' ? (
                      <span className="text-emerald-700 font-semibold">
                        Resolved on {new Date(searchedTicket.resolvedAt || '').toLocaleDateString()}
                      </span>
                    ) : searchedTicket.status === 'Waiting for Customer' ? (
                      <span className="text-purple-700">Awaiting your response/site approval</span>
                    ) : (
                      <span>Active ticket under NOC surveillance dispatch</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Resolution Summary if present */}
              {searchedTicket.resolutionSummary && (
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                  <span className="font-bold block mb-1">Resolution Summary:</span>
                  <p>{searchedTicket.resolutionSummary}</p>
                </div>
              )}

              {/* Activity Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Progress Updates & Activity Log ({searchedTicket.activityLogs.length})
                </h4>

                <div className="space-y-2 border-l-2 border-slate-200 pl-4 ml-2">
                  {searchedTicket.activityLogs.map((log) => (
                    <div key={log.id} className="relative pb-2">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{log.author}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1 rounded">
                          {log.role}
                        </span>
                        <span>·</span>
                        <span>
                          {new Date(log.timestamp).toLocaleDateString()} at{' '}
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-0.5">{log.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Follow-up Note Form */}
              <form onSubmit={handleAddCustomerNote} className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Have more information? Add a comment or reply to this ticket:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type an update or question for our team..."
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!customerNote.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition disabled:opacity-50 cursor-pointer"
                  >
                    Send Note
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
              <Search className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs text-slate-600 font-medium">
                Search with your ticket reference ID (e.g., ADN-2026-000001)
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                You can also enter your contact email address to find all tickets associated with you.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
