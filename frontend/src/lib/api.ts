import { ACCESS_TOKEN_KEY } from "./auth-storage";

export type ApiEnvelope<T> = {
  code: number;
  message: string;
  data: T;
};

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type Property = {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

type LoginData = {
  refresh: string;
  access: string;
  user: UserProfile;
};

let onUnauthorized: () => void = () => {};

export function configureApi(handlers: { onUnauthorized: () => void }) {
  onUnauthorized = handlers.onUnauthorized;
}

function readAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

async function parseJson<T>(res: Response): Promise<ApiEnvelope<T>> {
  const text = await res.text();
  try {
    return JSON.parse(text) as ApiEnvelope<T>;
  } catch {
    throw new Error(text || res.statusText || "Invalid response");
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<ApiEnvelope<T>> {
  const { auth = false, headers: hdrs, ...rest } = options;
  const headers = new Headers(hdrs);
  if (!headers.has("Content-Type") && rest.body) {
    headers.set("Content-Type", "application/json");
  }
  if (auth) {
    const t = readAccessToken();
    if (t) {
      headers.set("Authorization", `Bearer ${t}`);
    }
  }

  const res = await fetch(path, { ...rest, headers });
  const body = await parseJson<T>(res);

  if (auth && (body.code === 401 || res.status === 401)) {
    onUnauthorized();
  }

  if (!res.ok || body.code >= 400) {
    const raw = body.message;
    const msg =
      typeof raw === "string"
        ? raw
        : Array.isArray(raw)
          ? String(raw[0] ?? "Request failed")
          : "Request failed";
    const err = new Error(msg) as Error & { code?: number; data?: unknown };
    err.code = body.code;
    err.data = body.data;
    throw err;
  }

  return body;
}

export async function loginRequest(email: string, password: string) {
  return apiFetch<LoginData>("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerRequest(
  name: string,
  email: string,
  password: string,
  role = "buyer",
) {
  return apiFetch<Record<string, never>>("/api/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role }),
  });
}

export async function fetchMe() {
  return apiFetch<UserProfile>("/api/me", { auth: true });
}

export async function createProperty(payload: {
  name: string;
  description: string;
  price: string;
  image: string;
}) {
  return apiFetch<Property>("/api/properties", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function fetchCatalog(page: number, pageSize: number) {
  const q = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  return apiFetch<Paginated<Property>>(`/api/catalog?${q}`);
}

export async function fetchFavourites(page: number, pageSize: number) {
  const q = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  return apiFetch<Paginated<Property>>(`/api/favourites?${q}`, {
    auth: true,
  });
}

export async function toggleFavourite(propertyId: number, liked: boolean) {
  return apiFetch<Record<string, never>>("/api/favourites", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ property_id: propertyId, liked }),
  });
}
