type QueryFilter = {
  column: string;
  operator: "eq";
  value: unknown;
};

type QueryOrder = {
  column: string;
  ascending?: boolean;
};

type Session = {
  access_token: string;
  expires_at?: string;
};

const tokenKey = "ecoconnect_session";
const listeners = new Set<(event: string, session: { user: any; access_token: string } | null) => void>();

function getToken() {
  return localStorage.getItem(tokenKey);
}

function setToken(token: string | null) {
  if (token) localStorage.setItem(tokenKey, token);
  else localStorage.removeItem(tokenKey);
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.error || "Request failed");
  return json;
}

function notify(event: string, session: any) {
  listeners.forEach(listener => listener(event, session));
}

class QueryBuilder {
  private op = "select";
  private filters: QueryFilter[] = [];
  private ordering?: QueryOrder;
  private maxRows?: number;
  private payload: unknown;
  private selectColumns = "*";
  private selectOptions: any;
  private singleRow = false;
  private maybeSingleRow = false;
  private orExpression?: string;
  private conflictColumns?: string;

  constructor(private table: string) {}

  select(columns = "*", options?: any) {
    this.selectColumns = columns;
    this.selectOptions = options;
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ column, operator: "eq", value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.ordering = { column, ascending: options?.ascending };
    return this;
  }

  limit(count: number) {
    this.maxRows = count;
    return this;
  }

  or(expression: string) {
    this.orExpression = expression;
    return this;
  }

  insert(payload: unknown) {
    this.op = "insert";
    this.payload = payload;
    return this;
  }

  update(payload: unknown) {
    this.op = "update";
    this.payload = payload;
    return this;
  }

  upsert(payload: unknown, options?: { onConflict?: string }) {
    this.op = "upsert";
    this.payload = payload;
    this.conflictColumns = options?.onConflict;
    return this;
  }

  single() {
    this.singleRow = true;
    return this.execute();
  }

  maybeSingle() {
    this.maybeSingleRow = true;
    return this.execute();
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }

  async execute() {
    try {
      const result = await request("/api/query", {
        method: "POST",
        body: JSON.stringify({
          table: this.table,
          op: this.op,
          payload: this.payload,
          filters: this.filters,
          order: this.ordering,
          limit: this.maxRows,
          single: this.singleRow,
          maybeSingle: this.maybeSingleRow,
          count: this.selectOptions?.count,
          head: this.selectOptions?.head,
          orFilter: this.orExpression,
          onConflict: this.conflictColumns,
          select: this.selectColumns,
        }),
      });
      return { data: result.data ?? null, count: result.count ?? null, error: null };
    } catch (error) {
      return { data: null, count: null, error };
    }
  }
}

export const apiClient = {
  from(table: string) {
    return new QueryBuilder(table);
  },
  auth: {
    onAuthStateChange(callback: (event: string, session: any) => void) {
      listeners.add(callback);
      return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
    },
    async getSession() {
      const token = getToken();
      if (!token) return { data: { session: null }, error: null };
      try {
        const { user } = await request("/api/auth/me");
        return { data: { session: { user, access_token: token } }, error: null };
      } catch (error) {
        setToken(null);
        return { data: { session: null }, error };
      }
    },
    async signUp({ email, password, options }: { email: string; password: string; options?: { data?: { full_name?: string; phone?: string } } }) {
      try {
        const data = await request("/api/auth/signup", {
          method: "POST",
          body: JSON.stringify({ email, password, fullName: options?.data?.full_name, phone: options?.data?.phone }),
        });
        setToken(data.session.access_token);
        notify("SIGNED_IN", { user: data.user, ...data.session });
        return { data, error: null };
      } catch (error) {
        return { data: { user: null, session: null }, error };
      }
    },
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      try {
        const data = await request("/api/auth/signin", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setToken(data.session.access_token);
        notify("SIGNED_IN", { user: data.user, ...data.session });
        return { data, error: null };
      } catch (error) {
        return { data: { user: null, session: null }, error };
      }
    },
    async signOut() {
      try {
        await request("/api/auth/signout", { method: "POST" });
      } finally {
        setToken(null);
        notify("SIGNED_OUT", null);
      }
      return { error: null };
    },
  },
  async uploadImage(file: File, bucket: string) {
    const form = new FormData();
    form.append("file", file);
    form.append("bucket", bucket);
    const data = await request("/api/upload", { method: "POST", body: form });
    return data.publicUrl as string;
  },
  async completeWorkerTask(taskId: string, completionImageUrl: string | null) {
    return request("/api/worker/complete-task", {
      method: "POST",
      body: JSON.stringify({ taskId, completionImageUrl }),
    });
  },
};

export type { Session };