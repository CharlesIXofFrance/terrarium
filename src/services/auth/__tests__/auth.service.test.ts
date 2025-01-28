import type {
  AuthOtpResponse,
  SignInWithPasswordlessCredentials,
  SignOut,
  AuthError,
  Session,
  OAuthResponse,
  SignInWithOAuthCredentials,
  AuthChangeEvent,
  Subscription,
  Provider,
} from '@supabase/supabase-js';
import {
  PostgrestFilterBuilder as PostgrestFilterBuilderType,
  PostgrestBuilder,
  PostgrestSingleResponse,
} from '@supabase/postgrest-js';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { AuthService } from '../index';
import { UserRole } from '@/lib/utils/types';
import { supabase } from '@/lib/supabase';

// Partial implementation of PostgrestFilterBuilder for testing
class MockFilterBuilder<
  Schema extends Database['public'],
  Row extends Record<string, unknown>,
  Result = Row,
  RelationName = unknown,
  Relationships = unknown,
> implements
    Partial<
      PostgrestFilterBuilderType<
        Schema,
        Row,
        Result,
        RelationName,
        Relationships
      >
    >
{
  data: Result | null = null;
  error: null = null;

  mockResolvedValueOnce(value: {
    data: Result | null;
    error: null;
  }): MockFilterBuilder<Schema, Row, Result, RelationName, Relationships> {
    this.data = value.data;
    this.error = value.error;
    return this;
  }

  single<
    ResultOne = Result extends (infer ResultOne)[] ? ResultOne : never,
  >(): PostgrestBuilder<ResultOne> {
    const response: PostgrestSingleResponse<ResultOne> = {
      data: this.data as ResultOne,
      error: this.error,
      count: null,
      status: 200,
      statusText: 'OK',
    };

    return new MockPostgrestBuilder(response);
  }

  throwOnError(): PostgrestFilterBuilderType<
    Schema,
    Row,
    Result,
    RelationName,
    Relationships
  > {
    return this as unknown as PostgrestFilterBuilderType<
      Schema,
      Row,
      Result,
      RelationName,
      Relationships
    >;
  }

  eq<ColumnName extends string & keyof Row>(
    _column: ColumnName,
    _value: Row[ColumnName]
  ): PostgrestFilterBuilderType<
    Schema,
    Row,
    Result,
    RelationName,
    Relationships
  > {
    return this as unknown as PostgrestFilterBuilderType<
      Schema,
      Row,
      Result,
      RelationName,
      Relationships
    >;
  }

  neq<ColumnName extends string & keyof Row>(
    _column: ColumnName,
    _value: Row[ColumnName]
  ): PostgrestFilterBuilderType<
    Schema,
    Row,
    Result,
    RelationName,
    Relationships
  > {
    return this as unknown as PostgrestFilterBuilderType<
      Schema,
      Row,
      Result,
      RelationName,
      Relationships
    >;
  }

  gt<ColumnName extends string & keyof Row>(
    _column: ColumnName,
    _value: Row[ColumnName]
  ): PostgrestFilterBuilderType<
    Schema,
    Row,
    Result,
    RelationName,
    Relationships
  > {
    return this as unknown as PostgrestFilterBuilderType<
      Schema,
      Row,
      Result,
      RelationName,
      Relationships
    >;
  }

  gte<ColumnName extends string & keyof Row>(
    _column: ColumnName,
    _value: Row[ColumnName]
  ): PostgrestFilterBuilderType<
    Schema,
    Row,
    Result,
    RelationName,
    Relationships
  > {
    return this as unknown as PostgrestFilterBuilderType<
      Schema,
      Row,
      Result,
      RelationName,
      Relationships
    >;
  }

  lt<ColumnName extends string & keyof Row>(
    _column: ColumnName,
    _value: Row[ColumnName]
  ): PostgrestFilterBuilderType<
    Schema,
    Row,
    Result,
    RelationName,
    Relationships
  > {
    return this as unknown as PostgrestFilterBuilderType<
      Schema,
      Row,
      Result,
      RelationName,
      Relationships
    >;
  }

  lte<ColumnName extends string & keyof Row>(
    _column: ColumnName,
    _value: Row[ColumnName]
  ): PostgrestFilterBuilderType<
    Schema,
    Row,
    Result,
    RelationName,
    Relationships
  > {
    return this as unknown as PostgrestFilterBuilderType<
      Schema,
      Row,
      Result,
      RelationName,
      Relationships
    >;
  }

  like<ColumnName extends string & keyof Row>(
    _column: ColumnName,
    _pattern: string
  ): PostgrestFilterBuilderType<
    Schema,
    Row,
    Result,
    RelationName,
    Relationships
  > {
    return this as unknown as PostgrestFilterBuilderType<
      Schema,
      Row,
      Result,
      RelationName,
      Relationships
    >;
  }

  ilike<ColumnName extends string & keyof Row>(
    _column: ColumnName,
    _pattern: string
  ): PostgrestFilterBuilderType<
    Schema,
    Row,
    Result,
    RelationName,
    Relationships
  > {
    return this as unknown as PostgrestFilterBuilderType<
      Schema,
      Row,
      Result,
      RelationName,
      Relationships
    >;
  }

  is<ColumnName extends string & keyof Row>(
    _column: ColumnName,
    _value: boolean | null
  ): PostgrestFilterBuilderType<
    Schema,
    Row,
    Result,
    RelationName,
    Relationships
  > {
    return this as unknown as PostgrestFilterBuilderType<
      Schema,
      Row,
      Result,
      RelationName,
      Relationships
    >;
  }

  in<ColumnName extends string & keyof Row>(
    _column: ColumnName,
    _values: readonly Row[ColumnName][]
  ): PostgrestFilterBuilderType<
    Schema,
    Row,
    Result,
    RelationName,
    Relationships
  > {
    return this as unknown as PostgrestFilterBuilderType<
      Schema,
      Row,
      Result,
      RelationName,
      Relationships
    >;
  }

  contains<ColumnName extends string & keyof Row>(
    _column: ColumnName,
    _value: string | Record<string, unknown> | readonly Row[ColumnName][]
  ): PostgrestFilterBuilderType<
    Schema,
    Row,
    Result,
    RelationName,
    Relationships
  > {
    return this as unknown as PostgrestFilterBuilderType<
      Schema,
      Row,
      Result,
      RelationName,
      Relationships
    >;
  }

  containedBy<ColumnName extends string & keyof Row>(
    _column: ColumnName,
    _value: string | Record<string, unknown> | readonly Row[ColumnName][]
  ): PostgrestFilterBuilderType<
    Schema,
    Row,
    Result,
    RelationName,
    Relationships
  > {
    return this as unknown as PostgrestFilterBuilderType<
      Schema,
      Row,
      Result,
      RelationName,
      Relationships
    >;
  }

  range(
    _from: number,
    _to: number,
    _options?: { foreignTable?: string; referencedTable?: string }
  ): PostgrestFilterBuilderType<
    Schema,
    Row,
    Result,
    RelationName,
    Relationships
  > {
    return this as unknown as PostgrestFilterBuilderType<
      Schema,
      Row,
      Result,
      RelationName,
      Relationships
    >;
  }

  textSearch<ColumnName extends string & keyof Row>(
    _column: ColumnName,
    _query: string,
    _options?: { config?: string; type?: 'plain' | 'phrase' | 'websearch' }
  ): PostgrestFilterBuilderType<
    Schema,
    Row,
    Result,
    RelationName,
    Relationships
  > {
    return this as unknown as PostgrestFilterBuilderType<
      Schema,
      Row,
      Result,
      RelationName,
      Relationships
    >;
  }

  match<ColumnName extends string & keyof Row>(
    _query: Record<ColumnName, Row[ColumnName]>
  ): PostgrestFilterBuilderType<
    Schema,
    Row,
    Result,
    RelationName,
    Relationships
  > {
    return this as unknown as PostgrestFilterBuilderType<
      Schema,
      Row,
      Result,
      RelationName,
      Relationships
    >;
  }

  not<ColumnName extends string & keyof Row>(
    _column: ColumnName,
    _operator: string,
    _value: Row[ColumnName]
  ): PostgrestFilterBuilderType<
    Schema,
    Row,
    Result,
    RelationName,
    Relationships
  > {
    return this as unknown as PostgrestFilterBuilderType<
      Schema,
      Row,
      Result,
      RelationName,
      Relationships
    >;
  }

  or(
    _filters: string,
    _options?: { foreignTable?: string; referencedTable?: string }
  ): PostgrestFilterBuilderType<
    Schema,
    Row,
    Result,
    RelationName,
    Relationships
  > {
    return this as unknown as PostgrestFilterBuilderType<
      Schema,
      Row,
      Result,
      RelationName,
      Relationships
    >;
  }

  filter<ColumnName extends string & keyof Row>(
    _column: ColumnName,
    _operator: string,
    _value: Row[ColumnName]
  ): PostgrestFilterBuilderType<
    Schema,
    Row,
    Result,
    RelationName,
    Relationships
  > {
    return this as unknown as PostgrestFilterBuilderType<
      Schema,
      Row,
      Result,
      RelationName,
      Relationships
    >;
  }
}

// Base mock class that implements the minimum required interface
class BasePostgrestBuilder<T> extends PostgrestBuilder<T> {
  constructor() {
    const builder = new (class extends PostgrestBuilder<T> {
      url = new URL('http://mock-url.com');
      headers = {};
      schema = undefined;
      method = 'GET' as const;
      shouldThrowOnError = false;
      isMaybeSingle = false;
      body = undefined;
      signal = undefined;
      fetch = ((_input: URL | RequestInfo, _init?: RequestInit) =>
        Promise.resolve(new Response())) as PostgrestBuilder<T>['fetch'];

      constructor() {
        // Create a temporary builder class
        class TempBuilder extends PostgrestBuilder<T> {
          url = new URL('http://mock-url.com');
          headers = {};
          schema = undefined;
          method = 'GET' as const;
          shouldThrowOnError = false;
          isMaybeSingle = false;
          fetch = ((_input: URL | RequestInfo) =>
            Promise.resolve(new Response())) as PostgrestBuilder<T>['fetch'];

          constructor() {
            super(undefined as unknown as PostgrestBuilder<T>);
          }

          throwOnError(): this {
            return this;
          }

          setHeader(_name: string, _value: string): this {
            return this;
          }

          then<TResult1 = PostgrestSingleResponse<T>, TResult2 = never>(
            onfulfilled?:
              | ((
                  value: PostgrestSingleResponse<T>
                ) => TResult1 | PromiseLike<TResult1>)
              | null
              | undefined,
            onrejected?:
              | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
              | null
              | undefined
          ): PromiseLike<TResult1 | TResult2> {
            return Promise.resolve({
              data: null,
              error: null,
            } as PostgrestSingleResponse<T>).then(onfulfilled, onrejected);
          }
        }

        super(new TempBuilder());
      }

      throwOnError(): this {
        return this;
      }

      setHeader(_name: string, _value: string): this {
        return this;
      }

      then<TResult1 = PostgrestSingleResponse<T>, TResult2 = never>(
        onfulfilled?:
          | ((
              value: PostgrestSingleResponse<T>
            ) => TResult1 | PromiseLike<TResult1>)
          | null
          | undefined,
        onrejected?:
          | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
          | null
          | undefined
      ): PromiseLike<TResult1 | TResult2> {
        return Promise.resolve({
          data: null,
          error: null,
        } as PostgrestSingleResponse<T>).then(onfulfilled, onrejected);
      }
    })();

    super(builder);
  }

  throwOnError(): this {
    return this;
  }

  setHeader(_name: string, _value: string): this {
    return this;
  }
}

class MockPostgrestBuilder<ResultOne> extends BasePostgrestBuilder<ResultOne> {
  protected url = new URL('http://mock-url.com');
  protected headers = {};
  protected schema = undefined;
  protected method: 'GET' | 'HEAD' | 'POST' | 'PATCH' | 'DELETE' = 'GET';
  protected shouldThrowOnError = false;
  public isMaybeSingle = false;
  private response: PostgrestSingleResponse<ResultOne>;
  public fetch = () =>
    Promise.resolve(
      new Response(JSON.stringify(this.response), {
        status: this.response.status,
        statusText: this.response.statusText,
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      })
    );

  constructor(response: PostgrestSingleResponse<ResultOne>) {
    super();
    this.response = response;
    Object.assign(this, response);
  }

  then<TResult1 = PostgrestSingleResponse<ResultOne>, TResult2 = never>(
    onfulfilled?:
      | ((
          value: PostgrestSingleResponse<ResultOne>
        ) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.response).then(onfulfilled, onrejected);
  }
}

interface CommunityTable {
  Row: {
    id: string;
    slug: string;
    name: string;
    [key: string]: unknown;
  };
  Insert: Omit<CommunityTable['Row'], 'id'>;
  Update: Partial<CommunityTable['Row']>;
}

interface Database {
  public: {
    Tables: {
      communities: CommunityTable;
    };
    Views: Record<
      string,
      {
        Row: Record<string, unknown>;
      }
    >;
    Functions: Record<
      string,
      {
        Args: Record<string, unknown>;
        Returns: unknown;
      }
    >;
  };
}

const createMockBuilder = <
  T extends Record<string, unknown>,
>(): MockFilterBuilder<Database['public'], T, T, unknown, unknown> => {
  return new MockFilterBuilder<Database['public'], T, T, unknown, unknown>();
};

const createMockFrom = (
  mockBuilder: MockFilterBuilder<
    Database['public'],
    CommunityTable['Row'],
    CommunityTable['Row'],
    unknown,
    unknown
  >
): PostgrestFilterBuilderType<
  Database['public'],
  CommunityTable['Row'],
  CommunityTable['Row'],
  unknown,
  unknown
> => {
  return mockBuilder as unknown as PostgrestFilterBuilderType<
    Database['public'],
    CommunityTable['Row'],
    CommunityTable['Row'],
    unknown,
    unknown
  >;
};

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOtp: vi
        .fn()
        .mockImplementation(({ email }): Promise<AuthOtpResponse> => {
          if (email === 'rate.limited@test.com') {
            return Promise.resolve({
              data: {
                user: null,
                session: null,
                messageId: null,
              },
              error: {
                message: 'Too many requests',
                name: 'AuthApiError',
                status: 429,
                code: 'too_many_requests',
                __isAuthError: true,
              },
            });
          }
          return Promise.resolve({
            data: {
              user: null,
              session: null,
              messageId: 'mock-message-id',
            },
            error: null,
          });
        }),
      signOut: vi.fn(),
      getSession: vi.fn(),
      signInWithOAuth: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => createMockBuilder()),
  },
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create a new instance of AuthService
    authService = new AuthService();
  });

  describe('Email Authentication', () => {
    it('should send magic link', async () => {
      const email = 'test@example.com';
      const role = UserRole.MEMBER;

      // Mock window.location
      const originalWindow = { ...window };
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'test.terrarium.com',
          origin: 'https://test.terrarium.com',
        },
        writable: true,
      });

      const result = await authService.signInWithEmail(email, { role });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Check your email for the magic link.');
      expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
        email,
        options: {
          data: {
            role,
            communitySlug: 'test',
            isNewUser: false,
          },
          emailRedirectTo:
            'https://test.terrarium.com/auth/callback?subdomain=test',
          shouldCreateUser: false,
        },
      });

      // Restore window
      Object.defineProperty(window, 'location', {
        value: originalWindow.location,
        writable: true,
      });
    });

    it('should handle rate limiting', async () => {
      const email = 'rate.limited@test.com';
      const role = UserRole.MEMBER;

      // Mock window.location
      const originalWindow = { ...window };
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'test.terrarium.com',
          origin: 'https://test.terrarium.com',
        },
        writable: true,
      });

      const result = await authService.signInWithEmail(email, { role });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Too many requests');
      expect(result.error).toBe('Too many requests');

      // Restore window
      Object.defineProperty(window, 'location', {
        value: originalWindow.location,
        writable: true,
      });
    });
  });
});
