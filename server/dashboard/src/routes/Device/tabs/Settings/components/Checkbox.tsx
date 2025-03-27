import { Checkbox as MCheckbox, CheckboxProps as MCheckboxProps } from "@mantine/core";
import React from "react";

interface CheckboxProps extends Omit<MCheckboxProps, "value"> {
  value: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({ value, ...props }) => (
  <MCheckbox checked={value} {...props} />
);

export default Checkbox;
