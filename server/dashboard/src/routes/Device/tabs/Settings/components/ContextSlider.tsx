import { Slider, SliderProps } from "@mantine/core";

const ContextSlider: React.FC<SliderProps> = (...props) => (
  <Slider
    name="msgsToKeep"
    label={null}
    marks={[
      { value: 0, label: "0" },
      { value: 10, label: "10" },
      { value: 20, label: "20" },
      { value: 30, label: "30" },
      { value: 40, label: "40" },
      { value: 50, label: "50" },
    ]}
    defaultValue={20}
    min={0}
    max={50}
    step={10}
    mb="1.25rem"
    {...props}
  />
);

export default ContextSlider;