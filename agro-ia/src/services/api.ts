const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface User {
  id: string;
  nombre: string;
  email: string;
  email_verificado: boolean;
  fecha_registro?: string;
  ultima_sesion?: string;
  google_id?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    const token = localStorage.getItem('authToken');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la petición');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData: {
    nombre: string;
    email: string;
    contraseña: string;
  }): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/registro', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    contraseña: string;
  }): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/perfil');
  }

  async requestPasswordRecovery(email: string): Promise<ApiResponse> {
    return this.request('/recuperar-contraseña', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, nueva_contraseña: string): Promise<ApiResponse> {
    return this.request(`/restablecer-contraseña/${token}`, {
      method: 'POST',
      body: JSON.stringify({ nueva_contraseña }),
    });
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    return this.request(`/verificar-email/${token}`, {
      method: 'GET',
    });
  }

  // Google OAuth endpoints
  async googleAuth(token: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async getGoogleAuthUrl(): Promise<ApiResponse<{ authUrl: string }>> {
    return this.request<{ authUrl: string }>('/auth/google/url');
  }

  // Utility methods
  setAuthToken(token: string) {
    localStorage.setItem('authToken', token);
  }

  removeAuthToken() {
    localStorage.removeItem('authToken');
  }

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

export const apiService = new ApiService();
