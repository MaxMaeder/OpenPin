import { ActionIcon, Grid, Menu } from "@mantine/core";
import { IconDotsVertical, IconDownload, IconTrash } from "@tabler/icons-react";
import classes from "./MediaEntry.module.css";
import { useMediaThumbnail } from "src/lightbox/useMediaThumbnail";
import { DeviceCaptureType } from "src/state/slices/capturesSlice";
import VideoMedia from "./VideoMedia";
import ImageMedia from "./ImageMedia";


interface MediaEntryProps {
  id: string;
  date: Date;
  type: DeviceCaptureType;
  src: string;
  onDelete: () => void;
}

const MediaEntry = ({ id, date, type, src, onDelete }: MediaEntryProps) => {
  const { onClick: enlargeMedia } = useMediaThumbnail({
    id,
    date,
    type,
    src
  });

  return (
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

      {type == "video" ? (<VideoMedia src={src} onEnlarge={enlargeMedia} />) : (<ImageMedia src={src} onEnlarge={enlargeMedia} />)}
    </Grid.Col>
  )
};

export default MediaEntry;