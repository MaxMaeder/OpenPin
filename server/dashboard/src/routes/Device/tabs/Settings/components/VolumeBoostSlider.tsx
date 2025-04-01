import { Slider, SliderProps } from "@mantine/core";

const VolumeBoostSlider: React.FC<SliderProps> = ({ ...props }) => (
  <Slider
    name="translateVolumeBoost"
    label={null}
    marks={[
      { value: 1, label: "100%" },
      { value: 1.25, label: "125%" },
      { value: 1.5, label: "150%" },
      { value: 1.75, label: "175%" },
      { value: 2, label: "200%" },
    ]}
    min={1}
    max={2}
    step={0.05}
    mb="1.25rem"
    {...props}
  />
);

export default VolumeBoostSlider;