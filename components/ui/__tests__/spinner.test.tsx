import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "../spinner";

describe("Spinner", () => {
  it("renders with default props", () => {
    render(<Spinner />);
    const spinner = screen.getByLabelText("Loading");
    expect(spinner).toBeInTheDocument();
  });

  it("applies small size class", () => {
    render(<Spinner size="sm" />);
    const spinner = screen.getByLabelText("Loading");
    expect(spinner).toHaveClass("h-4", "w-4");
  });

  it("applies medium size class", () => {
    render(<Spinner size="md" />);
    const spinner = screen.getByLabelText("Loading");
    expect(spinner).toHaveClass("h-8", "w-8");
  });

  it("applies large size class", () => {
    render(<Spinner size="lg" />);
    const spinner = screen.getByLabelText("Loading");
    expect(spinner).toHaveClass("h-12", "w-12");
  });

  it("applies custom className", () => {
    render(<Spinner className="text-blue-500" />);
    const spinner = screen.getByLabelText("Loading");
    expect(spinner).toHaveClass("text-blue-500");
  });

  it("has animate-spin class", () => {
    render(<Spinner />);
    const spinner = screen.getByLabelText("Loading");
    expect(spinner).toHaveClass("animate-spin");
  });
});
