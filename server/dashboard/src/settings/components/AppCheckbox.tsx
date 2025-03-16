import { Checkbox, CheckboxProps } from "@mantine/core";

interface AppCheckbox extends Omit<CheckboxProps, "value"> {
  value: boolean;
}

const AppCheckbox = ({ value, ...props }: AppCheckbox) => (
  <Checkbox checked={value} {...props} />
);

export default AppCheckbox;
