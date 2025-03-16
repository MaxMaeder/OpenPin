import { Slider, SliderProps } from "@mantine/core";

const PercentageSlider = (props: SliderProps) => (
  <Slider
    label={null}
    marks={[
      { value: 0, label: "0%" },
      { value: 1, label: "100%" },
    ]}
    defaultValue={0.8}
    min={0}
    max={1}
    step={0.05}
    {...props}
  />
);

export default PercentageSlider;
