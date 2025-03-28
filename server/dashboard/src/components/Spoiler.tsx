import { ReactNode } from "react"
import { Spoiler as MSpoiler } from "@mantine/core";

interface SpoilerProps {
  children: ReactNode;
}

const Spoiler: React.FC<SpoilerProps> = ({ children }) => (
  <MSpoiler maxHeight={120} showLabel="Show more" hideLabel="Hide">
    {children}
  </MSpoiler>
);

export default Spoiler;