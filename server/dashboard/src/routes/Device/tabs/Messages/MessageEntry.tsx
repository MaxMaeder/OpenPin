import { Title, Text, Space, Grid, Paper } from "@mantine/core";
import TextEntry from "../../components/TextEntry";
import Spoiler from "src/components/Spoiler";
import { useMediaThumbnail } from "src/lightbox/useMediaThumbnail";
import { DeviceMessage } from "src/state/slices/msgsSlice";
import { useAuthToken } from "src/comm/AuthTokenProvider";
import api from "src/comm/api";

interface MessageImageProps {
  idToken: string;
  date: Date;
  imageId: string;
}

const MessageImage = ({ idToken, date, imageId }: MessageImageProps) => {
  const imgSrc = api.getMediaDownloadUrl(idToken, imageId);

  const { onClick: enlargeMedia } = useMediaThumbnail({
    id: imageId,
    date,
    type: "image",
    src: imgSrc,
  });

  return (
    <Grid.Col span={{ xs: 12, sm: 4, md: 3 }}>
      <Paper
        component="img"
        src={imgSrc}
        withBorder
        w="100%"
        onClick={enlargeMedia}
        style={{ cursor: "zoom-in" }}
      />
    </Grid.Col>
  )
}

interface MessageEntryProps {
  message: DeviceMessage;
  onDelete: () => void;
}

const MessageEntry = ({ message: msg, onDelete }: MessageEntryProps) => {
  const { idToken } = useAuthToken();

  return (
    <TextEntry date={msg.date} onDelete={onDelete}>
      <Grid>
        {(msg.userImgId && idToken) && (
          <MessageImage
            idToken={idToken}
            date={msg.date}
            imageId={msg.userImgId}
          />
        )}
        <Grid.Col span={{ xs: 12, sm: 8, md: 9 }}>
          <Title order={3} size="sm">User Speech</Title>
          <Spoiler>
            <Text fs="italic">{msg.userMsg}</Text>
          </Spoiler>
          <Space h="md" />
          <Title order={3} size="sm">Assistant Response</Title>
          <Spoiler>
            <Text>{msg.assistantMsg}</Text>
          </Spoiler>
        </Grid.Col>
      </Grid>
    </TextEntry>
  )
};

export default MessageEntry;