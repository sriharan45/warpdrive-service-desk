import {
  User,
  Ticket,
  TicketDetail,
  TicketListResponse,
  ChatAssistantResponse,
  ConfirmationCardPayload,
  MLPredictResponse,
  MLMetricsResponse,
  DomainAdminMetrics,
  OrgAdminMetrics,
  AuditLog,
  Department
} from '../types';

function resolveBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();

  // If no env var set (e.g. local dev with Vite proxy or Vercel serverless proxy), default to '/api'
  if (!envUrl) {
    return '/api';
  }

  // Strip trailing slashes
  let cleanUrl = envUrl.replace(/\/+$/, '');

  // If URL doesn't end with /api, ensure /api is appended because FastAPI routes are mounted under /api
  if (!cleanUrl.endsWith('/api')) {
    cleanUrl = `${cleanUrl}/api`;
  }

  return cleanUrl;
}

export const BASE_URL = resolveBaseUrl();

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('warpdrive_token');
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err: any) {
    console.error(`[API Network Error] ${BASE_URL}${endpoint}:`, err);
    throw new ApiError(
      `Unable to reach WarpDrive API (${BASE_URL}). ` +
      `The Render backend may be waking up from free-tier sleep (takes ~30-50s), ` +
      `or CORS/network access was blocked. Please wait a moment and try again.`,
      0
    );
  }

  if (response.status === 401) {
    // If unauthorized, clear token if expired
    if (!endpoint.includes('/auth/login')) {
      localStorage.removeItem('warpdrive_token');
      localStorage.removeItem('warpdrive_user');
      window.dispatchEvent(new Event('auth_change'));
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.detail || data?.message || `Request failed with status ${response.status}`;
    throw new ApiError(errorMsg, response.status);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ access_token: string; token_type: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getCurrentUser: () => request<User>('/auth/me'),

  logout: () =>
    request<{ message: string }>('/auth/logout', {
      method: 'POST',
    }),

  setupDemo: () =>
    request<{ status: string; message: string; accounts: Array<{ role: string; email: string; name: string }> }>('/auth/setup-demo', {
      method: 'POST',
    }),

  // Tickets
  createTicket: (data: {
    subject: string;
    description: string;
    category?: string;
    priority?: string;
    department?: string;
    conversation_id?: number;
  }) =>
    request<Ticket>('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createTicketFromChat: (data: ConfirmationCardPayload & { conversation_id: number }) =>
    request<Ticket>('/tickets/create-from-chat', {
      method: 'POST',
      body: JSON.stringify({
        conversation_id: data.conversation_id,
        subject: data.subject,
        description: data.description,
        category: data.category,
        priority: data.priority,
        department: data.department,
        ml_confidence: data.ml_confidence,
      }),
    }),

  getMyTickets: (params?: { status?: string; priority?: string; search?: string; page?: number; page_size?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.priority) searchParams.set('priority', params.priority);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.page_size) searchParams.set('page_size', params.page_size.toString());
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<TicketListResponse>(`/tickets/my${query}`);
  },

  getTicketDetail: (ticketId: number) => request<TicketDetail>(`/tickets/${ticketId}`),

  updateTicketStatus: (ticketId: number, status: string, resolution_notes?: string, notes?: string) =>
    request<TicketDetail>(`/tickets/${ticketId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, resolution_notes, notes }),
    }),

  addInternalNote: (ticketId: number, note: string) =>
    request<{ id: number; note: string; author_name: string; created_at: string }>(`/tickets/${ticketId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    }),

  // AI Chat
  sendChatMessage: (content: string, conversation_id?: number) =>
    request<ChatAssistantResponse>('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ content, conversation_id }),
    }),

  getConversations: () => request<any[]>('/chat/conversations'),
  getConversationDetail: (convId: number) => request<any>(`/chat/conversations/${convId}`),

  // ML
  predictDepartment: (text: string) =>
    request<MLPredictResponse>('/ml/predict', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  getMLMetrics: () => request<MLMetricsResponse>('/ml/metrics'),

  // Domain Admin
  getDomainMetrics: () => request<DomainAdminMetrics>('/admin/domain/metrics'),
  getDomainTickets: (params?: { queue?: string; priority?: string; search?: string; page?: number; page_size?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.queue) searchParams.set('queue', params.queue);
    if (params?.priority) searchParams.set('priority', params.priority);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.page_size) searchParams.set('page_size', params.page_size.toString());
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<TicketListResponse>(`/admin/domain/tickets${query}`);
  },

  // Org Admin
  getOrgMetrics: () => request<OrgAdminMetrics>('/admin/org/metrics'),
  getOrgTickets: (params?: { department?: string; status?: string; priority?: string; search?: string; page?: number; page_size?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.department) searchParams.set('department', params.department);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.priority) searchParams.set('priority', params.priority);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.page_size) searchParams.set('page_size', params.page_size.toString());
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<TicketListResponse>(`/admin/org/tickets${query}`);
  },

  getAuditLogs: (limit = 50) => request<AuditLog[]>(`/admin/org/audit-logs?limit=${limit}`),
  getDepartments: () => request<Department[]>('/admin/departments'),

  // Health
  checkHealth: () => request<{ status: string; database: string }>('/health'),
};
