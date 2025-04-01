import { ComboboxItem, Select as MSelect, SelectProps as MSelectProps } from "@mantine/core";
import { useCallback } from "react";

interface SelectProps<T> extends Omit<MSelectProps, "value" | "onChange" | "data"> {
  value: T;
  onChange: (value: T, option: ComboboxItem) => void;
  data: readonly { value: T; label: string }[];
}

const Select = <T extends string>({ value, onChange, ...props }: SelectProps<T>) => {
  const handleOnChange = useCallback((value: string | null, option: ComboboxItem) => {
    if (!value) return;

    onChange(value as T, option);
  }, [onChange]);

  return <MSelect value={value} onChange={handleOnChange} {...props} />
};

export default Select;