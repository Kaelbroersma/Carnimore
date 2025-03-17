import { User } from '@supabase/supabase-js';

export interface AuthUser extends User {
  user_metadata: {
    first_name?: string;
    last_name?: string;
    acceptMarketing?: boolean;
    acceptedTerms?: boolean;
  };
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export interface SignUpData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  acceptedTerms: boolean;
  acceptMarketing?: boolean;
}

export interface SignInData {
  email: string;
  password: string;
}