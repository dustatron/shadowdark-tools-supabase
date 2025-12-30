/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createAuditLog,
  type CreateAuditLogParams,
} from "@/lib/services/audit";
import type { SupabaseClient } from "@supabase/supabase-js";

describe("Audit Service", () => {
  describe("createAuditLog", () => {
    let mockSupabase: SupabaseClient;

    beforeEach(() => {
      // Mock Supabase client with insert operation
      mockSupabase = {
        from: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn(),
      } as unknown as SupabaseClient;
    });

    it("should create audit log with minimal params and return UUID", async () => {
      const mockUuid = "123e4567-e89b-12d3-a456-426614174000";
      const params: CreateAuditLogParams = {
        actionType: "user_ban",
        adminUserId: "admin-uuid-123",
      };

      // Mock successful insert
      (mockSupabase.single as any).mockResolvedValue({
        data: { id: mockUuid },
        error: null,
      });

      const result = await createAuditLog(mockSupabase, params);

      expect(result).toBe(mockUuid);
      expect(mockSupabase.from).toHaveBeenCalledWith("audit_logs");
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        action_type: "user_ban",
        admin_user_id: "admin-uuid-123",
        target_id: null,
        target_type: null,
        details: {},
        notes: null,
      });
      expect(mockSupabase.select).toHaveBeenCalledWith("id");
      expect(mockSupabase.single).toHaveBeenCalled();
    });

    it("should create audit log with all optional params", async () => {
      const mockUuid = "223e4567-e89b-12d3-a456-426614174001";
      const params: CreateAuditLogParams = {
        actionType: "flag_resolved",
        adminUserId: "admin-uuid-456",
        targetId: "target-uuid-789",
        targetType: "user_monster",
        details: {
          reason: "inappropriate content",
          severity: "high",
        },
        notes: "User violated community guidelines",
      };

      // Mock successful insert
      (mockSupabase.single as any).mockResolvedValue({
        data: { id: mockUuid },
        error: null,
      });

      const result = await createAuditLog(mockSupabase, params);

      expect(result).toBe(mockUuid);
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        action_type: "flag_resolved",
        admin_user_id: "admin-uuid-456",
        target_id: "target-uuid-789",
        target_type: "user_monster",
        details: {
          reason: "inappropriate content",
          severity: "high",
        },
        notes: "User violated community guidelines",
      });
    });

    it("should create audit log with partial optional params", async () => {
      const mockUuid = "323e4567-e89b-12d3-a456-426614174002";
      const params: CreateAuditLogParams = {
        actionType: "content_review",
        adminUserId: "admin-uuid-789",
        targetId: "monster-uuid-999",
        targetType: "monster",
      };

      // Mock successful insert
      (mockSupabase.single as any).mockResolvedValue({
        data: { id: mockUuid },
        error: null,
      });

      const result = await createAuditLog(mockSupabase, params);

      expect(result).toBe(mockUuid);
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        action_type: "content_review",
        admin_user_id: "admin-uuid-789",
        target_id: "monster-uuid-999",
        target_type: "monster",
        details: {},
        notes: null,
      });
    });

    it("should create audit log with only notes (no other optional params)", async () => {
      const mockUuid = "423e4567-e89b-12d3-a456-426614174003";
      const params: CreateAuditLogParams = {
        actionType: "admin_login",
        adminUserId: "admin-uuid-999",
        notes: "Logged in from new IP address",
      };

      // Mock successful insert
      (mockSupabase.single as any).mockResolvedValue({
        data: { id: mockUuid },
        error: null,
      });

      const result = await createAuditLog(mockSupabase, params);

      expect(result).toBe(mockUuid);
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        action_type: "admin_login",
        admin_user_id: "admin-uuid-999",
        target_id: null,
        target_type: null,
        details: {},
        notes: "Logged in from new IP address",
      });
    });

    it("should create audit log with complex details object", async () => {
      const mockUuid = "523e4567-e89b-12d3-a456-426614174004";
      const params: CreateAuditLogParams = {
        actionType: "bulk_delete",
        adminUserId: "admin-uuid-111",
        details: {
          deletedCount: 42,
          affectedUsers: ["user-1", "user-2", "user-3"],
          timestamp: "2025-12-19T10:30:00Z",
          metadata: {
            source: "admin_panel",
            batch_id: "batch-xyz",
          },
        },
      };

      // Mock successful insert
      (mockSupabase.single as any).mockResolvedValue({
        data: { id: mockUuid },
        error: null,
      });

      const result = await createAuditLog(mockSupabase, params);

      expect(result).toBe(mockUuid);
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        action_type: "bulk_delete",
        admin_user_id: "admin-uuid-111",
        target_id: null,
        target_type: null,
        details: {
          deletedCount: 42,
          affectedUsers: ["user-1", "user-2", "user-3"],
          timestamp: "2025-12-19T10:30:00Z",
          metadata: {
            source: "admin_panel",
            batch_id: "batch-xyz",
          },
        },
        notes: null,
      });
    });

    it("should throw error when insert fails", async () => {
      const params: CreateAuditLogParams = {
        actionType: "user_ban",
        adminUserId: "admin-uuid-123",
      };

      // Mock database error
      (mockSupabase.single as any).mockResolvedValue({
        data: null,
        error: {
          message: "Database connection failed",
          code: "CONNECTION_ERROR",
        },
      });

      await expect(createAuditLog(mockSupabase, params)).rejects.toThrow(
        "Failed to create audit log: Database connection failed",
      );
    });

    it("should throw error when no data returned", async () => {
      const params: CreateAuditLogParams = {
        actionType: "user_ban",
        adminUserId: "admin-uuid-123",
      };

      // Mock missing data
      (mockSupabase.single as any).mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(createAuditLog(mockSupabase, params)).rejects.toThrow(
        "Failed to create audit log: No data returned",
      );
    });

    it("should handle empty details object", async () => {
      const mockUuid = "623e4567-e89b-12d3-a456-426614174005";
      const params: CreateAuditLogParams = {
        actionType: "test_action",
        adminUserId: "admin-uuid-222",
        details: {},
      };

      // Mock successful insert
      (mockSupabase.single as any).mockResolvedValue({
        data: { id: mockUuid },
        error: null,
      });

      const result = await createAuditLog(mockSupabase, params);

      expect(result).toBe(mockUuid);
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        action_type: "test_action",
        admin_user_id: "admin-uuid-222",
        target_id: null,
        target_type: null,
        details: {},
        notes: null,
      });
    });

    it("should handle empty string notes", async () => {
      const mockUuid = "723e4567-e89b-12d3-a456-426614174006";
      const params: CreateAuditLogParams = {
        actionType: "test_action",
        adminUserId: "admin-uuid-333",
        notes: "",
      };

      // Mock successful insert
      (mockSupabase.single as any).mockResolvedValue({
        data: { id: mockUuid },
        error: null,
      });

      const result = await createAuditLog(mockSupabase, params);

      expect(result).toBe(mockUuid);
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        action_type: "test_action",
        admin_user_id: "admin-uuid-333",
        target_id: null,
        target_type: null,
        details: {},
        notes: "",
      });
    });

    it("should verify correct method chaining", async () => {
      const mockUuid = "823e4567-e89b-12d3-a456-426614174007";
      const params: CreateAuditLogParams = {
        actionType: "test_chain",
        adminUserId: "admin-uuid-444",
      };

      const mockFrom = vi.fn().mockReturnValue(mockSupabase);
      const mockInsert = vi.fn().mockReturnValue(mockSupabase);
      const mockSelect = vi.fn().mockReturnValue(mockSupabase);
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: mockUuid },
        error: null,
      });

      mockSupabase.from = mockFrom;
      mockSupabase.insert = mockInsert;
      mockSupabase.select = mockSelect;
      mockSupabase.single = mockSingle;

      const result = await createAuditLog(mockSupabase, params);

      expect(result).toBe(mockUuid);
      expect(mockFrom).toHaveBeenCalledTimes(1);
      expect(mockInsert).toHaveBeenCalledTimes(1);
      expect(mockSelect).toHaveBeenCalledTimes(1);
      expect(mockSingle).toHaveBeenCalledTimes(1);
    });
  });
});
