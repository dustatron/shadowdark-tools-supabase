import { NextResponse } from "next/server";

// Standard API response helpers
export class ApiResponse {
  static success(data: any, status: number = 200) {
    return NextResponse.json(data, { status });
  }

  static error(message: string, status: number = 500, details?: any) {
    const response: any = { error: message };
    if (details) {
      response.details = details;
    }
    return NextResponse.json(response, { status });
  }

  static validationError(errors: any[]) {
    return NextResponse.json(
      {
        error: "Validation error",
        details: errors,
      },
      { status: 400 },
    );
  }

  static unauthorized(message: string = "Authentication required") {
    return NextResponse.json({ error: message }, { status: 401 });
  }

  static forbidden(message: string = "Access denied") {
    return NextResponse.json({ error: message }, { status: 403 });
  }

  static notFound(message: string = "Resource not found") {
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

// Pagination helper
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function parsePaginationParams(
  searchParams: URLSearchParams,
): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || "20")),
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function createPaginationResponse(
  page: number,
  limit: number,
  total: number,
) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPreviousPage: page > 1,
  };
}

// Database error helper
export function handleDatabaseError(
  error: any,
  operation: string = "database operation",
) {
  console.error(`Database error during ${operation}:`, error);

  if (error.code === "23505") {
    return ApiResponse.error("Resource already exists", 409);
  }

  if (error.code === "23503") {
    return ApiResponse.error("Referenced resource not found", 400);
  }

  if (error.code === "42501") {
    return ApiResponse.forbidden("Insufficient permissions");
  }

  return ApiResponse.error(`Failed to ${operation}`);
}

// JSON parsing helper
export function parseJsonField(field: any): any {
  if (typeof field === "string") {
    try {
      return JSON.parse(field);
    } catch {
      return field;
    }
  }
  return field;
}

// Monster data helper
export function parseMonsterData(monster: any) {
  return {
    ...monster,
    attacks: parseJsonField(monster.attacks),
    abilities: parseJsonField(monster.abilities),
    tags: parseJsonField(monster.tags),
    treasure: parseJsonField(monster.treasure),
  };
}

// URL validation helper
export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

// Email validation helper
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Sanitize string for file names
export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}
