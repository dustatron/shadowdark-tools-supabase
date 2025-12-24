/**
 * Audit Service
 *
 * Replaces: supabase.rpc("create_audit_log", {...})
 * Used by: /api/admin/users/[id], /api/admin/flags/[id]
 */

import { SupabaseClient } from "@supabase/supabase-js";

// ============================================================================
// Types
// ============================================================================

export interface CreateAuditLogParams {
  /** Type of admin action performed */
  actionType: string;
  /** UUID of admin performing the action */
  adminUserId: string;
  /** UUID of target entity (user, flag, etc.) */
  targetId?: string;
  /** Type of target entity */
  targetType?: string;
  /** Additional action details as JSON */
  details?: Record<string, unknown>;
  /** Human-readable notes about the action */
  notes?: string;
}

export interface AuditLogEntry {
  id: string;
  admin_user_id: string;
  action_type: string;
  target_id: string | null;
  target_type: string | null;
  details: Record<string, unknown>;
  notes: string | null;
  created_at: string;
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Create an audit log entry for admin actions.
 * Note: Caller is responsible for verifying admin status before calling.
 *
 * @param supabase - Supabase client instance
 * @param params - Audit log parameters
 * @returns UUID of created audit log entry
 */
export async function createAuditLog(
  supabase: SupabaseClient,
  params: CreateAuditLogParams,
): Promise<string> {
  const { data, error } = await supabase
    .from("audit_logs")
    .insert({
      action_type: params.actionType,
      admin_user_id: params.adminUserId,
      target_id: params.targetId ?? null,
      target_type: params.targetType ?? null,
      details: params.details ?? {},
      notes: params.notes ?? null,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create audit log: ${error.message}`);
  }

  if (!data) {
    throw new Error("Failed to create audit log: No data returned");
  }

  return data.id;
}
