import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UnifiedSearchForm } from "@/components/search/UnifiedSearchForm";

describe("UnifiedSearchForm", () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders search input field", () => {
    render(<UnifiedSearchForm onSubmit={mockOnSubmit} />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<UnifiedSearchForm onSubmit={mockOnSubmit} />);
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("renders source filter options", () => {
    render(<UnifiedSearchForm onSubmit={mockOnSubmit} />);
    expect(screen.getByLabelText(/all/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/core/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/user generated/i)).toBeInTheDocument();
  });

  it("renders content type checkboxes", () => {
    render(<UnifiedSearchForm onSubmit={mockOnSubmit} />);
    expect(screen.getByLabelText(/monsters/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/magic items/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/equipment/i)).toBeInTheDocument();
  });

  it("renders limit selector", () => {
    render(<UnifiedSearchForm onSubmit={mockOnSubmit} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("calls onSubmit with form values when submitted", async () => {
    const user = userEvent.setup();
    render(<UnifiedSearchForm onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, "goblin");

    const submitButton = screen.getByRole("button", { name: /search/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          q: "goblin",
        }),
      );
    });
  });

  it("submits form on Enter key press", async () => {
    const user = userEvent.setup();
    render(<UnifiedSearchForm onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, "goblin{enter}");

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it("displays validation error when query is too short", async () => {
    const user = userEvent.setup();
    render(<UnifiedSearchForm onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, "ab");

    const submitButton = screen.getByRole("button", { name: /search/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/3 characters/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("allows unchecking content type checkboxes", async () => {
    const user = userEvent.setup();
    render(<UnifiedSearchForm onSubmit={mockOnSubmit} />);

    const monstersCheckbox = screen.getByLabelText(/monsters/i);
    await user.click(monstersCheckbox);

    expect(monstersCheckbox).not.toBeChecked();
  });

  it("displays error when all content types are unchecked", async () => {
    const user = userEvent.setup();
    render(<UnifiedSearchForm onSubmit={mockOnSubmit} />);

    // Uncheck all content types
    await user.click(screen.getByLabelText(/monsters/i));
    await user.click(screen.getByLabelText(/magic items/i));
    await user.click(screen.getByLabelText(/equipment/i));

    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, "sword");

    const submitButton = screen.getByRole("button", { name: /search/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/at least one/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("changes source filter when radio button is clicked", async () => {
    const user = userEvent.setup();
    render(<UnifiedSearchForm onSubmit={mockOnSubmit} />);

    const coreRadio = screen.getByLabelText(/core/i);
    await user.click(coreRadio);

    expect(coreRadio).toBeChecked();
  });

  it("disables submit button when isLoading is true", () => {
    render(<UnifiedSearchForm onSubmit={mockOnSubmit} isLoading={true} />);

    const submitButton = screen.getByRole("button", { name: /search/i });
    expect(submitButton).toBeDisabled();
  });
});
