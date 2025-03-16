import { Slider, SliderProps } from "@mantine/core";

const UpdateFreqSlider = (props: SliderProps) => (
  <Slider
    label={null}
    marks={[
      { value: 0, label: "10s" },
      { value: 1, label: "30s" },
      { value: 2, label: "1m" },
      { value: 3, label: "5m" },
      { value: 4, label: "10m" },
      { value: 5, label: "1h" },
      { value: 6, label: "never" },
    ]}
    defaultValue={2}
    min={0}
    max={6}
    step={1}
    {...props}
  />
);

export default UpdateFreqSlider;
