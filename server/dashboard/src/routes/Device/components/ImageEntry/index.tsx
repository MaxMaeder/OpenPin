import { ActionIcon, Grid, Menu, Paper } from "@mantine/core";
import { IconDotsVertical, IconDownload, IconTrash } from "@tabler/icons-react";
import classes from "./ImageEntry.module.css";

interface ImageEntryProps {
  src: string;
  onDelete: () => void;
}

const ImageEntry: React.FC<ImageEntryProps> = ({ src, onDelete }) => (
  <Grid.Col span={{ xs: 12, sm: 6, lg: 4 }} pos="relative">
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <ActionIcon variant="white" className={classes.detailsButton}>
          <IconDotsVertical color="black" className={classes.detailsIcon} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconDownload size={14} />}
          component="a"
          href={src}
          download={true}
        >
          Download
        </Menu.Item>
        <Menu.Item
          color="red"
          leftSection={<IconTrash size={14} />}
          onClick={onDelete}
        >
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>

    <Paper
      withBorder
      shadow="md"

      component="img"
      src={src}
      display="block"
      w="100%"
    />
  </Grid.Col>
);

export default ImageEntry;