import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingOverlay } from "../loading-overlay";

describe("LoadingOverlay", () => {
  it("does not render when visible is false", () => {
    const { container } = render(<LoadingOverlay visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders when visible is true", () => {
    render(<LoadingOverlay visible={true} />);
    const overlay = screen.getByRole("dialog");
    expect(overlay).toBeInTheDocument();
  });

  it("displays loading message when provided", () => {
    const message = "Loading data...";
    render(<LoadingOverlay visible={true} message={message} />);
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it("does not display message when not provided", () => {
    render(<LoadingOverlay visible={true} />);
    const text = screen.queryByText(/loading/i);
    expect(text).not.toBeInTheDocument();
  });

  it("has correct accessibility attributes", () => {
    render(<LoadingOverlay visible={true} />);
    const overlay = screen.getByRole("dialog");
    expect(overlay).toHaveAttribute("aria-modal", "true");
    expect(overlay).toHaveAttribute("aria-label", "Loading");
  });

  it("has semi-transparent backdrop", () => {
    render(<LoadingOverlay visible={true} />);
    const overlay = screen.getByRole("dialog");
    expect(overlay).toHaveClass("bg-black/50");
  });

  it("message has aria-live attribute", () => {
    render(<LoadingOverlay visible={true} message="Loading..." />);
    const message = screen.getByText("Loading...");
    expect(message).toHaveAttribute("aria-live", "polite");
  });
});
