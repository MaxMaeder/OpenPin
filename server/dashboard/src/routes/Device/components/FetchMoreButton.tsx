import { Button, Center } from "@mantine/core";

interface FetchMoreButtonProps {
  disabled: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const FetchMoreButton: React.FC<FetchMoreButtonProps> = ({ disabled, onClick }) => (
  <Center>
    <Button disabled={disabled} onClick={onClick}>Load More</Button>
  </Center>
);

export default FetchMoreButton;
