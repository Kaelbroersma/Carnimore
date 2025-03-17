import { callNetlifyFunction } from '../lib/supabase';
import type { SignUpData, SignInData } from '../types/auth';
import type { Result } from '../types/database';
import { useAuthStore } from '../store/authStore';

export const authService = {
  async signUp({ email, password, first_name, last_name, acceptedTerms, acceptMarketing }: SignUpData): Promise<Result<void>> {
    try {
      if (!acceptedTerms) {
        throw new Error('Terms must be accepted to create an account');
      }

      const result = await callNetlifyFunction('signUp', {
        email,
        password,
        options: {
          data: {
            first_name,
            last_name,
            acceptedTerms,
            acceptMarketing
          }
        }
      });

      if (result.error) throw result.error;

      // Set user in auth store immediately
      if (result.data?.user) {
        useAuthStore.getState().setUser(result.data.user);
      }

      return { data: null, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to sign up',
          details: error.details || error.message
        }
      };
    }
  },

  async signIn({ email, password }: SignInData): Promise<Result<void>> {
    try {
      const result = await callNetlifyFunction('signIn', {
        email,
        password
      });

      if (result.error) throw result.error;

      // Set user in auth store immediately
      if (result.data?.user) {
        useAuthStore.getState().setUser(result.data.user);
      }

      return { data: null, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to sign in',
          details: error.details || error.message
        }
      };
    }
  },

  async signOut(): Promise<Result<void>> {
    try {
      const result = await callNetlifyFunction('signOut');
      if (result.error) throw result.error;
      
      // Clear user from auth store immediately
      useAuthStore.getState().setUser(null);
      
      return { data: null, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to sign out',
          details: error.details || error.message
        }
      };
    }
  }
};