import { LoginCredentials, RegisterData, User } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const IS_MOCK = true;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || response.statusText || 'Request failed');
  }
  return response.json();
}

// Mock user data
const mockUsers = {
  member: {
    id: 'test-member',
    email: 'member@test.com',
    name: 'Test Member',
    role: 'member',
    communities: ['women-in-fintech'],
    createdAt: new Date().toISOString(),
    profileComplete: 70,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
  },
  admin: {
    id: 'test-admin',
    email: 'admin@test.com',
    name: 'Test Admin',
    role: 'admin',
    communities: ['women-in-fintech'],
    createdAt: new Date().toISOString(),
  }
};

export async function login(credentials: LoginCredentials): Promise<User> {
  if (IS_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test credentials for member access
    if (credentials.email === 'member@test.com') {
      return mockUsers.member;
    }
    
    // Test credentials for admin access
    if (credentials.email === 'admin@test.com') {
      return mockUsers.admin;
    }

    throw new Error('Invalid email or password');
  }

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });

  return handleResponse<{ user: User }>(response).then(data => data.user);
}

export async function register(data: RegisterData): Promise<User> {
  if (IS_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = {
      id: crypto.randomUUID(),
      email: data.email,
      name: data.name,
      role: 'member',
      communities: ['women-in-fintech'],
      createdAt: new Date().toISOString(),
    };

    return user;
  }

  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  return handleResponse<{ user: User }>(response).then(data => data.user);
}

export async function logout(): Promise<void> {
  if (IS_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.removeItem('user');
    return;
  }

  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  await handleResponse(response);
}

export async function getCurrentUser(): Promise<User | null> {
  if (IS_MOCK) {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return null;
    
    try {
      const user = JSON.parse(storedUser);
      return user.email === 'member@test.com' ? mockUsers.member : 
             user.email === 'admin@test.com' ? mockUsers.admin : 
             user;
    } catch (error) {
      console.error('Failed to parse stored user:', error);
      localStorage.removeItem('user');
      return null;
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) return null;
      throw new Error('Failed to get current user');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}