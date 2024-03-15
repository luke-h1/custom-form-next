import { ChangeEvent, FormEvent, useState } from "react";

interface Validation {
  required?: {
    value: boolean;
    message: string;
  };
  pattern?: {
    value: string;
    message: string;
  };
  custom?: {
    isValid: (value: string) => boolean;
    message: string;
  };
}

type ErrorRecord<T> = Partial<Record<keyof T, string>>;
type Validations<T extends object> = Partial<Record<keyof T, Validation>>;

interface Options<T extends object> {
  validations?: Validations<T>;
  initialValues?: Partial<T>;
  onSubmit?: () => void;
}

export const useForm = <TValue extends Record<keyof TValue, any> = {}>(
  options: Options<TValue>
) => {
  const [data, setData] = useState<Partial<TValue>>(
    options.initialValues || {}
  );
  const [errors, setErrors] = useState<ErrorRecord<TValue>>({});

  const handleChange =
    <S extends unknown>(key: keyof TValue, sanitiseFn?: (value: string) => S) =>
    (e: ChangeEvent<HTMLInputElement & HTMLSelectElement>) => {
      const value = sanitiseFn ? sanitiseFn(e.target.value) : e.target.value;
      setData({
        ...data,
        [key]: value,
      });
    };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { validations } = options;

    if (validations) {
      let valid = true;
      const errors: ErrorRecord<TValue> = {};
      for (const key in validations) {
        const value = data[key];
        const validation = validations[key];

        if (validation?.required?.value && !value) {
          valid = false;
          errors[key] = validation.required.message;
        }

        const pattern = validation?.pattern;

        if (pattern?.value && !RegExp(pattern.value).test(value as string)) {
          valid = false;
          errors[key] = pattern.message;
        }

        const custom = validation?.custom;

        if (custom?.isValid && !custom.isValid(value as string)) {
          valid = false;
          errors[key] = custom.message;
        }
      }

      if (!valid) {
        setErrors(errors);
        return;
      }
    }

    setErrors({});
    options.onSubmit?.();
  };

  return {
    data,
    errors,
    handleChange,
    handleSubmit,
  };
};
