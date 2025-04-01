import { Slider, SliderProps } from "@mantine/core";

const VoiceSpeedSlider: React.FC<SliderProps> = ({ ...props }) => (
  <Slider
    name="voiceSpeed"
    label={null}
    marks={[
      { value: 0.5, label: "0.5x" },
      { value: 0.75, label: "0.75x" },
      { value: 1, label: "1x" },
      { value: 1.25, label: "1.25x" },
      { value: 1.5, label: "1.5x" },
    ]}
    min={0.5}
    max={1.5}
    step={0.05}
    mb="1.25rem"
    {...props}
  />
);

export default VoiceSpeedSlider;