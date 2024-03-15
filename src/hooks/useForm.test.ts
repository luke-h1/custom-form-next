import { renderHook, act } from "@testing-library/react-hooks";
import { useForm } from "./useForm";
import { ChangeEvent } from "react";

describe("useForm", () => {
  const getFakeTestEvent = (value: any = "") =>
    ({
      preventDefault: jest.fn(),
      target: { value },
    } as unknown as ChangeEvent<any>);
  it("should handle input change", () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { test: "" },
      })
    );

    act(() => {
      return result.current.handleChange("test")({
        preventDefault: jest.fn(),
        target: { value: "new value" },
      } as unknown as ChangeEvent<any>);
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

  it("should initialize defaultValues", () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: {
          name: "John",
        },
      })
    );

    expect(result.current.data.name).toBe("John");
  });

  it("should not submit for if validation errors", () => {
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

  it("should reset errors on submit", () => {
    const validationMessage = "The minimum length is 7 characters.";
    const onSubmit = jest.fn();
    const { result } = renderHook(() =>
      useForm({
        validations: {
          name: {
            custom: {
              isValid: (value) => value?.length > 6,
              message: validationMessage,
            },
          },
        },
        onSubmit,
      })
    );

    // Name is too short
    onSubmit.mockReset();
    act(() => {
      result.current.handleChange("name")(getFakeTestEvent("123"));
    });

    act(() => {
      result.current.handleSubmit(getFakeTestEvent());
    });

    expect(onSubmit).toHaveBeenCalledTimes(0);
    expect(result.current.errors.name).toBe(validationMessage);

    // Name is long enough
    act(() => {
      result.current.handleChange("name")(getFakeTestEvent("Felix123"));
    });

    act(() => {
      result.current.handleSubmit(getFakeTestEvent());
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(result.current.errors.name).toBeUndefined();
  });
});
