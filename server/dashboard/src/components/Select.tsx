import { ComboboxItem, Select as MSelect, SelectProps as MSelectProps } from "@mantine/core";
import { useCallback } from "react";

interface SelectProps extends Omit<MSelectProps, "value" | "onChange"> {
  value: string;
  onChange: (value: string, option: ComboboxItem) => void;
}

const Select: React.FC<SelectProps> = ({ value, onChange, ...props }) => {
  const handleOnChange = useCallback((value: string | null, option: ComboboxItem) => {
    if (!value) return;

    onChange(value, option);
  }, [onChange]);

  return <MSelect value={value} onChange={handleOnChange} {...props} />
};

export default Select;