export type UserRole = 'employee' | 'domain_admin' | 'org_admin';

export type TicketStatus = 'Pending' | 'In Progress' | 'Completed' | 'Reopened';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type DepartmentName = 'IT Support' | 'Technical' | 'HR' | 'Accounts' | 'Maintenance';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  department?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string | null;
}

export interface TicketStatusHistory {
  id: number;
  ticket_id: number;
  old_status: string;
  new_status: string;
  changed_by_name: string;
  notes?: string | null;
  created_at: string;
}

export interface InternalNote {
  id: number;
  ticket_id: number;
  author_id: number;
  author_name: string;
  note: string;
  created_at: string;
}

export interface ConversationMessage {
  id: number;
  conversation_id: number;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  metadata_json?: string | null;
  created_at: string;
}

export interface Conversation {
  id: number;
  user_id: number;
  title: string;
  status: string;
  created_at: string;
  messages: ConversationMessage[];
}

export interface Ticket {
  id: number;
  ticket_code: string;
  employee_id: number;
  employee_name: string;
  employee_email: string;
  department: string;
  subject: string;
  description: string;
  category: string;
  priority: TicketPriority;
  ml_predicted_department?: string | null;
  ml_confidence?: number | null;
  status: TicketStatus;
  assigned_admin_id?: number | null;
  resolution_notes?: string | null;
  conversation_id?: number | null;
  created_at: string;
  updated_at?: string | null;
}

export interface TicketDetail extends Ticket {
  status_history: TicketStatusHistory[];
  internal_notes: InternalNote[];
  conversation?: Conversation | null;
}

export interface TicketListResponse {
  items: Ticket[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ConfirmationCardPayload {
  subject: string;
  description: string;
  department: string;
  category: string;
  priority: TicketPriority;
  ml_confidence: number;
  confidence_percentage: number;
  is_ready_for_ticket: boolean;
}

export interface ChatAssistantResponse {
  conversation_id: number;
  reply: string;
  needs_clarification: boolean;
  confirmation_card?: ConfirmationCardPayload | null;
  predicted_department?: string | null;
  confidence?: number | null;
}

export interface DepartmentRank {
  department: string;
  confidence: number;
}

export interface MLPredictResponse {
  department: string;
  confidence: number;
  confidence_percentage: number;
  is_low_confidence: boolean;
  probabilities: Record<string, number>;
  ranked_departments: DepartmentRank[];
}

export interface MLMetricsResponse {
  model_type: string;
  sample_count: number;
  train_samples: number;
  test_samples: number;
  classes: string[];
  accuracy: number;
  macro_precision: number;
  macro_recall: number;
  macro_f1: number;
  weighted_f1: number;
  classification_report: Record<string, any>;
  confusion_matrix: number[][];
}

export interface DomainAdminMetrics {
  department: string;
  total_tickets: number;
  pending_tickets: number;
  in_progress_tickets: number;
  completed_tickets: number;
  urgent_tickets: number;
  avg_resolution_time_hours?: number;
}

export interface DepartmentDistribution {
  department: string;
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
}

export interface TrendDataPoint {
  date: string;
  created: number;
  completed: number;
}

export interface OrgAdminMetrics {
  total_tickets: number;
  pending_tickets: number;
  in_progress_tickets: number;
  completed_tickets: number;
  urgent_tickets: number;
  resolution_rate_percentage: number;
  department_distribution: DepartmentDistribution[];
  recent_trend: TrendDataPoint[];
  total_employees: number;
  total_admins: number;
}

export interface AuditLog {
  id: number;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  user_id?: number | null;
  user_email?: string | null;
  details?: string | null;
  created_at: string;
}
