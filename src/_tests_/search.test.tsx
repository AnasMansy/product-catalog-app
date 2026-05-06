import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import SearchBar from "@/components/SearchBar";

function SearchBarHarness({
  initialValue = "",
  isDisabled = false,
  onValueChange,
}: {
  initialValue?: string;
  isDisabled?: boolean;
  onValueChange: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <SearchBar
      value={value}
      isDisabled={isDisabled}
      onValueChange={(nextValue) => {
        setValue(nextValue);
        onValueChange(nextValue);
      }}
    />
  );
}

describe("SearchBar", () => {
  it("emits value changes from the search input", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn<(value: string) => void>();

    render(<SearchBarHarness onValueChange={onValueChange} />);

    await user.type(
      screen.getByPlaceholderText("Search products by title, brand, or category"),
      "phone",
    );

    expect(onValueChange).toHaveBeenCalled();
    expect(onValueChange).toHaveBeenLastCalledWith("phone");
  });

  it("shows and handles the clear button for a non-empty search value", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn<(value: string) => void>();

    render(
      <SearchBarHarness
        initialValue="laptop"
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(onValueChange).toHaveBeenCalledWith("");
  });

  it("respects the disabled state", () => {
    render(
      <SearchBarHarness
        initialValue="camera"
        isDisabled
        onValueChange={jest.fn<(value: string) => void>()}
      />,
    );

    expect(
      screen.getByPlaceholderText("Search products by title, brand, or category"),
    ).toBeDisabled();
  });
});
