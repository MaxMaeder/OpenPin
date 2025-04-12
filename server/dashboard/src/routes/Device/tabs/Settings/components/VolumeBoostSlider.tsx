import { Slider, SliderProps } from "@mantine/core";

const VolumeBoostSlider: React.FC<SliderProps> = ({ ...props }) => (
  <Slider
    name="translateVolumeBoost"
    label={null}
    marks={[
      { value: 1, label: "100%" },
      { value: 1.5, label: "150%" },
      { value: 2, label: "200%" },
      { value: 2.5, label: "250%" },
      { value: 3, label: "300%" },
    ]}
    min={1}
    max={3}
    step={0.05}
    mb="1.25rem"
    {...props}
  />
);

export default VolumeBoostSlider;