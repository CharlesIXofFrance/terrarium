// Future API route definitions for authentication
// This will be expanded when backend API is implemented

import { authService } from '../../backend/services/auth.service';
import type {
  LoginCredentials,
  RegisterData,
  AuthResult,
} from '../../backend/types/auth.types';

export const authRoutes = {
  login: async (credentials: LoginCredentials): Promise<AuthResult> => {
    try {
      return await authService.login(credentials);
    } catch (error) {
      console.error('Login route error:', error);
      throw error;
    }
  },

  register: async (
    data: RegisterData
  ): Promise<{ needsEmailVerification: boolean }> => {
    try {
      return await authService.register(data);
    } catch (error) {
      console.error('Register route error:', error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout route error:', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      return await authService.getCurrentUser();
    } catch (error) {
      console.error('Get current user route error:', error);
      throw error;
    }
  },

  resetPassword: async (email: string): Promise<void> => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      console.error('Reset password route error:', error);
      throw error;
    }
  },
};
