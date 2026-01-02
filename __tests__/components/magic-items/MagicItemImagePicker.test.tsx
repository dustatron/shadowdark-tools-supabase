import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MagicItemImagePicker } from "@/components/magic-items/MagicItemImagePicker";

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("MagicItemImagePicker", () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    value: undefined,
    onChange: mockOnChange,
    userId: "test-user-id",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Default Icons Tab", () => {
    it("renders default icons grid", () => {
      render(<MagicItemImagePicker {...defaultProps} />);

      // Should show the default icons tab by default
      expect(screen.getByRole("tab", { name: /default/i })).toBeInTheDocument();

      // Should have some icons visible (at least a few of the 15)
      expect(screen.getByText(/sword/i)).toBeInTheDocument();
    });

    it("shows all 15 default icons", () => {
      render(<MagicItemImagePicker {...defaultProps} />);

      // Count clickable icon buttons in the grid
      const iconButtons = screen.getAllByRole("button", {
        name: /select.*icon/i,
      });
      expect(iconButtons.length).toBeGreaterThanOrEqual(15);
    });

    it("calls onChange when clicking a default icon", async () => {
      const user = userEvent.setup();
      render(<MagicItemImagePicker {...defaultProps} />);

      // Click a default icon (e.g., sword)
      const swordButton = screen.getByRole("button", {
        name: /select sword icon/i,
      });
      await user.click(swordButton);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining("shadowdark/default-magic-items/sword"),
      );
    });

    it("shows selection state when icon is selected", () => {
      render(
        <MagicItemImagePicker
          {...defaultProps}
          value="shadowdark/default-magic-items/sword"
        />,
      );

      // The sword icon should have a selected state (e.g., ring, checkmark)
      const swordButton = screen.getByRole("button", {
        name: /select sword icon/i,
      });
      expect(swordButton).toHaveClass(/selected|ring|border/);
    });
  });

  describe("Upload Tab", () => {
    it("shows upload tab option", () => {
      render(<MagicItemImagePicker {...defaultProps} />);

      expect(
        screen.getByRole("tab", { name: /upload|custom/i }),
      ).toBeInTheDocument();
    });

    it("shows file input when upload tab is selected", async () => {
      const user = userEvent.setup();
      render(<MagicItemImagePicker {...defaultProps} />);

      // Click the upload tab
      const uploadTab = screen.getByRole("tab", { name: /upload|custom/i });
      await user.click(uploadTab);

      // Should show file input or upload button
      expect(
        screen.getByRole("button", { name: /upload|choose|browse/i }),
      ).toBeInTheDocument();
    });

    it("validates file size (15MB limit)", async () => {
      const user = userEvent.setup();
      const { toast } = await import("sonner");

      render(<MagicItemImagePicker {...defaultProps} />);

      // Switch to upload tab
      const uploadTab = screen.getByRole("tab", { name: /upload|custom/i });
      await user.click(uploadTab);

      // Create a file larger than 15MB
      const largeFile = new File(
        [new ArrayBuffer(16 * 1024 * 1024)], // 16MB
        "large-image.jpg",
        { type: "image/jpeg" },
      );

      const fileInput = screen.getByTestId("image-file-input");
      await user.upload(fileInput, largeFile);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            description: expect.stringContaining("15MB"),
          }),
        );
      });

      // Should NOT call onChange
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it("has accept attribute for image types only", async () => {
      const user = userEvent.setup();

      render(<MagicItemImagePicker {...defaultProps} />);

      // Switch to upload tab
      const uploadTab = screen.getByRole("tab", { name: /upload|custom/i });
      await user.click(uploadTab);

      const fileInput = screen.getByTestId("image-file-input");
      // Verify the input has the accept attribute for images
      expect(fileInput).toHaveAttribute("accept", "image/*");
    });
  });

  describe("Clear/Remove", () => {
    it("shows remove button when image is selected", () => {
      render(
        <MagicItemImagePicker
          {...defaultProps}
          value="https://res.cloudinary.com/demo/image/upload/test.jpg"
        />,
      );

      expect(
        screen.getByRole("button", { name: /remove|clear|delete/i }),
      ).toBeInTheDocument();
    });

    it("calls onChange with null when remove is clicked", async () => {
      const user = userEvent.setup();
      render(
        <MagicItemImagePicker
          {...defaultProps}
          value="https://res.cloudinary.com/demo/image/upload/test.jpg"
        />,
      );

      const removeButton = screen.getByRole("button", {
        name: /remove|clear|delete/i,
      });
      await user.click(removeButton);

      expect(mockOnChange).toHaveBeenCalledWith(null);
    });

    it("does not show remove button when no image", () => {
      render(<MagicItemImagePicker {...defaultProps} value={undefined} />);

      expect(
        screen.queryByRole("button", { name: /remove|clear|delete/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Preview", () => {
    it("shows preview of selected image", () => {
      render(
        <MagicItemImagePicker
          {...defaultProps}
          value="https://res.cloudinary.com/demo/image/upload/test.jpg"
        />,
      );

      const previewImage = screen.getByRole("img", {
        name: /preview|selected/i,
      });
      expect(previewImage).toBeInTheDocument();
      expect(previewImage).toHaveAttribute(
        "src",
        expect.stringContaining("cloudinary"),
      );
    });

    it("does not show preview when no image selected", () => {
      render(<MagicItemImagePicker {...defaultProps} value={undefined} />);

      expect(
        screen.queryByRole("img", { name: /preview|selected/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Disabled State", () => {
    it("disables all interactions when disabled prop is true", () => {
      render(<MagicItemImagePicker {...defaultProps} disabled={true} />);

      // Default icon buttons should be disabled
      const iconButtons = screen.getAllByRole("button");
      iconButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe("Loading State", () => {
    it("shows loading indicator during upload", async () => {
      // Mock fetch to delay
      global.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  json: () =>
                    Promise.resolve({
                      secure_url: "https://res.cloudinary.com/demo/test.jpg",
                    }),
                }),
              100,
            ),
          ),
      );

      const user = userEvent.setup();
      render(<MagicItemImagePicker {...defaultProps} />);

      // Switch to upload tab
      const uploadTab = screen.getByRole("tab", { name: /upload|custom/i });
      await user.click(uploadTab);

      // Create a valid image file
      const validFile = new File([new ArrayBuffer(1024)], "test-image.jpg", {
        type: "image/jpeg",
      });

      const fileInput = screen.getByTestId("image-file-input");
      await user.upload(fileInput, validFile);

      // Should show loading state
      expect(screen.getByText(/uploading|loading/i)).toBeInTheDocument();
    });
  });
});
