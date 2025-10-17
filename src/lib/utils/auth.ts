import { createClient } from "@/lib/supabase/server";

// User role hierarchy
export const USER_ROLES = {
  USER: "user",
  MODERATOR: "moderator",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Role hierarchy for permission checking
const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 1,
  moderator: 2,
  admin: 3,
};

// Check if user has required role or higher
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// Get current user with role
export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { user: null, profile: null, error: "Not authenticated" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return { user, profile: null, error: "Profile not found" };
  }

  return { user, profile, error: null };
}

// Authentication middleware helper
export async function requireAuth() {
  const { user, profile, error } = await getCurrentUser();

  if (error || !user) {
    return {
      error: "Authentication required",
      status: 401,
      user: null,
      profile: null,
    };
  }

  return { user, profile, error: null, status: 200 };
}

// Role-based authorization helper
export async function requireRole(requiredRole: UserRole) {
  const authResult = await requireAuth();

  if (authResult.error) {
    return authResult;
  }

  const { user, profile } = authResult;

  if (!profile || !hasRole(profile.role, requiredRole)) {
    return {
      error: `${requiredRole} access required`,
      status: 403,
      user,
      profile,
    };
  }

  return { user, profile, error: null, status: 200 };
}

// Check if user can access resource
export async function canAccessResource(
  resourceOwnerId: string,
  requiredRole: UserRole = USER_ROLES.USER,
) {
  const authResult = await requireAuth();

  if (authResult.error) {
    return authResult;
  }

  const { user, profile } = authResult;

  // Resource owner can always access
  if (user!.id === resourceOwnerId) {
    return { user, profile, error: null, status: 200 };
  }

  // Check if user has sufficient role
  if (!profile || !hasRole(profile.role, requiredRole)) {
    return {
      error: "Access denied",
      status: 403,
      user,
      profile,
    };
  }

  return { user, profile, error: null, status: 200 };
}

// Check if user is banned
export function isUserBanned(profile: any): boolean {
  return profile?.is_banned === true;
}

// Password strength validation
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (password.length > 100) {
    errors.push("Password must be less than 100 characters");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  // Check for common patterns
  const commonPatterns = ["123456", "password", "qwerty", "abc123"];
  if (
    commonPatterns.some((pattern) => password.toLowerCase().includes(pattern))
  ) {
    errors.push("Password contains common patterns and is not secure");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Generate session token (for API keys, etc.)
export function generateSecureToken(length: number = 32): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
