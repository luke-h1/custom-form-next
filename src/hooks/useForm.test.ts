import { renderHook, act } from "@testing-library/react-hooks";
import { useForm } from "./useForm";

describe("useForm", () => {
  it("should handle input change", () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { test: "" },
      })
    );

    act(() => {
      return result.current.handleChange("test")({
        target: { value: "new value" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.data).toEqual({ test: "new value" });
  });

  it("should handle form submission with no validations", () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() =>
      useForm({
        initialValues: { test: "" },
        onSubmit,
      })
    );

    act(() => {
      result.current.handleSubmit({
        preventDefault: () => {},
      } as React.FormEvent<HTMLFormElement>);
    });

    expect(onSubmit).toHaveBeenCalled();
  });

  it("should handle form submission with validations", () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() =>
      useForm({
        initialValues: { test: "" },
        onSubmit,
        validations: {
          test: {
            required: {
              value: true,
              message: "Required",
            },
          },
        },
      })
    );

    act(() => {
      result.current.handleSubmit({
        preventDefault: () => {},
      } as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.errors).toEqual({ test: "Required" });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("should handle form submission with validations and pass", () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() =>
      useForm({
        initialValues: { test: "test" },
        onSubmit,
        validations: {
          test: {
            required: {
              value: true,
              message: "Required",
            },
          },
        },
      })
    );

    act(() => {
      result.current.handleSubmit({
        preventDefault: () => {},
      } as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.errors).toEqual({});
    expect(onSubmit).toHaveBeenCalled();
  });

  it("should handle form submission with custom validation and fail", () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() =>
      useForm({
        initialValues: { test: "not test" },
        onSubmit,
        validations: {
          test: {
            custom: {
              isValid: (value: string) => value === "test",
              message: "Not test",
            },
          },
        },
      })
    );

    act(() => {
      result.current.handleSubmit({
        preventDefault: () => {},
      } as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.errors).toEqual({ test: "Not test" });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
