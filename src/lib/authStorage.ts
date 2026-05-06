import type {
  AuthResponse,
  DemoRegistrationData,
  DemoUserRecord,
  StoredAuthSession,
} from "@/types/auth";

export const AUTH_STORAGE_KEY = "product-catalog-auth";
export const DEMO_USER_STORAGE_KEY = "demoUser";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getNameParts(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const [firstName = "", ...rest] = fullName.trim().split(/\s+/);

  return {
    firstName,
    lastName: rest.join(" "),
  };
}

export function readStoredAuth(): StoredAuthSession | null {
  if (!isBrowser()) {
    return null;
  }

  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as StoredAuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function persistAuth(session: StoredAuthSession) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredAuth() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function readDemoUser(): DemoUserRecord | null {
  if (!isBrowser()) {
    return null;
  }

  const rawUser = window.localStorage.getItem(DEMO_USER_STORAGE_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as DemoUserRecord;
  } catch {
    window.localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    return null;
  }
}

export function persistDemoUser(
  registration: DemoRegistrationData,
): DemoUserRecord {
  const cleanedName = registration.name.trim();
  const { firstName, lastName } = getNameParts(cleanedName);
  const demoUser: DemoUserRecord = {
    id: Date.now(),
    name: cleanedName,
    username: registration.username.trim(),
    email: registration.email.trim().toLowerCase(),
    password: registration.password,
    firstName,
    lastName,
    createdAt: Date.now(),
  };

  if (isBrowser()) {
    window.localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
  }

  return demoUser;
}

export function createDummyJsonSession(
  response: AuthResponse,
): StoredAuthSession {
  return {
    token: response.accessToken,
    provider: "dummyjson",
    user: {
      id: response.id,
      username: response.username,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      gender: response.gender,
      image: response.image,
    },
  };
}

export function createDemoSession(
  demoUser: DemoUserRecord,
): StoredAuthSession {
  return {
    token: `demo-token-${Date.now()}`,
    provider: "demo",
    user: {
      id: demoUser.id,
      username: demoUser.username,
      email: demoUser.email,
      firstName: demoUser.firstName,
      lastName: demoUser.lastName,
    },
  };
}
