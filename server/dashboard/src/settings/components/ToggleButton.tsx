import { Button, ButtonProps } from "@mantine/core";

interface ToggleButtonProps extends ButtonProps {
  activeLabel: string;
  inactiveLabel: string;
  lockOn?: boolean; // If active, prevent user from deactivating
  value: boolean;
  onChange: (v: boolean) => void;
}

const ToggleButton = ({
  activeLabel,
  inactiveLabel,
  lockOn,
  value,
  onChange,
  ...props
}: ToggleButtonProps) => {
  return (
    <Button
      onClick={() => onChange(!value)}
      disabled={lockOn && value}
      {...props}
    >
      {value ? activeLabel : inactiveLabel}
    </Button>
  );
};

export default ToggleButton;
