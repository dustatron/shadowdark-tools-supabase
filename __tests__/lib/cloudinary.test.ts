/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getTransformedImageUrl,
  isCloudinaryUrl,
  getPublicIdFromUrl,
} from "@/lib/utils/cloudinary";

describe("Cloudinary Utils", () => {
  describe("getTransformedImageUrl", () => {
    it("returns null for null input", () => {
      expect(getTransformedImageUrl(null, "thumb")).toBeNull();
    });

    it("returns null for undefined input", () => {
      expect(getTransformedImageUrl(undefined, "thumb")).toBeNull();
    });

    it("returns thumb size (80x80) transform", () => {
      const url = "https://res.cloudinary.com/demo/image/upload/sample.jpg";
      const result = getTransformedImageUrl(url, "thumb");

      expect(result).toContain("w_80");
      expect(result).toContain("h_80");
      expect(result).toContain("c_fill");
    });

    it("returns card size (200x200) transform", () => {
      const url = "https://res.cloudinary.com/demo/image/upload/sample.jpg";
      const result = getTransformedImageUrl(url, "card");

      expect(result).toContain("w_200");
      expect(result).toContain("h_200");
      expect(result).toContain("c_fill");
    });

    it("returns detail size (400x400) transform", () => {
      const url = "https://res.cloudinary.com/demo/image/upload/sample.jpg";
      const result = getTransformedImageUrl(url, "detail");

      expect(result).toContain("w_400");
      expect(result).toContain("h_400");
      expect(result).toContain("c_fill");
    });

    it("returns pdf size (600w) transform without height", () => {
      const url = "https://res.cloudinary.com/demo/image/upload/sample.jpg";
      const result = getTransformedImageUrl(url, "pdf");

      expect(result).toContain("w_600");
      expect(result).not.toContain("h_");
      expect(result).toContain("c_scale");
    });

    it("handles URLs with version prefix", () => {
      const url =
        "https://res.cloudinary.com/demo/image/upload/v1234567890/folder/image.jpg";
      const result = getTransformedImageUrl(url, "thumb");

      expect(result).toContain("w_80");
      expect(result).toContain("folder/image.jpg");
      expect(result).not.toContain("v1234567890");
    });

    it("adds auto format for optimization", () => {
      const url = "https://res.cloudinary.com/demo/image/upload/sample.jpg";
      const result = getTransformedImageUrl(url, "thumb");

      expect(result).toContain("f_auto");
    });

    it("adds auto quality for optimization", () => {
      const url = "https://res.cloudinary.com/demo/image/upload/sample.jpg";
      const result = getTransformedImageUrl(url, "thumb");

      expect(result).toContain("q_auto");
    });

    it("handles public_id without full URL", () => {
      // Mock the env variable
      const originalEnv = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "test-cloud";

      const publicId = "shadowdark/default-magic-items/sword";
      const result = getTransformedImageUrl(publicId, "thumb");

      expect(result).toContain("res.cloudinary.com/test-cloud");
      expect(result).toContain("shadowdark/default-magic-items/sword");
      expect(result).toContain("w_80");

      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = originalEnv;
    });

    it("returns original URL for non-Cloudinary URLs", () => {
      const url = "https://example.com/image.jpg";
      const result = getTransformedImageUrl(url, "thumb");

      expect(result).toBe(url);
    });
  });

  describe("isCloudinaryUrl", () => {
    it("returns true for Cloudinary URLs", () => {
      expect(
        isCloudinaryUrl(
          "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        ),
      ).toBe(true);
    });

    it("returns false for non-Cloudinary URLs", () => {
      expect(isCloudinaryUrl("https://example.com/image.jpg")).toBe(false);
    });

    it("returns false for partial matches", () => {
      expect(isCloudinaryUrl("https://fake-cloudinary.com/image.jpg")).toBe(
        false,
      );
    });
  });

  describe("getPublicIdFromUrl", () => {
    it("extracts public_id from simple URL", () => {
      const url = "https://res.cloudinary.com/demo/image/upload/sample.jpg";
      expect(getPublicIdFromUrl(url)).toBe("sample.jpg");
    });

    it("extracts public_id from URL with folder", () => {
      const url =
        "https://res.cloudinary.com/demo/image/upload/folder/subfolder/image.png";
      expect(getPublicIdFromUrl(url)).toBe("folder/subfolder/image.png");
    });

    it("extracts public_id from URL with version", () => {
      const url =
        "https://res.cloudinary.com/demo/image/upload/v1234567890/folder/image.jpg";
      expect(getPublicIdFromUrl(url)).toBe("folder/image.jpg");
    });

    it("returns null for non-Cloudinary URL", () => {
      const url = "https://example.com/image.jpg";
      expect(getPublicIdFromUrl(url)).toBeNull();
    });
  });
});
