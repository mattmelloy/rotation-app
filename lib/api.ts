// API client — replaces the Supabase JS client
// Communicates with Express server (dev) or Vercel API routes (prod)

const API_BASE = (import.meta as any).env?.VITE_API_URL || '';

// ─── Token Management ───

const TOKEN_KEY = 'rotation_auth_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ─── HTTP Helper ───

async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    const body = await res.json();

    if (!res.ok) {
      return { data: null, error: body.error || `HTTP ${res.status}` };
    }

    return { data: body, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Network error' };
  }
}

// ─── Auth API ───

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export async function signUp(email: string, password: string) {
  const result = await apiFetch<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (result.data?.token) {
    setToken(result.data.token);
  }

  return result;
}

export async function signIn(email: string, password: string) {
  const result = await apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (result.data?.token) {
    setToken(result.data.token);
  }

  return result;
}

export async function getMe() {
  return apiFetch<{ user: AuthUser }>('/api/auth/me');
}

export function signOut() {
  clearToken();
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// ─── Data API ───

export interface UserData {
  meals: any[];
  week_slots: any[];
  shopping_list: string[];
}

export async function fetchUserData() {
  return apiFetch<UserData>('/api/data');
}

export async function saveUserData(data: { meals: any[]; week_slots: any[]; shopping_list: string[] }) {
  return apiFetch<{ success: boolean }>('/api/data', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
