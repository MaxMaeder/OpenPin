import { Title, Text, Space, Grid, Paper } from "@mantine/core";
import TextEntry from "../../components/TextEntry";
import Spoiler from "src/components/Spoiler";

interface MessageEntryProps {
  date: Date;
  userMsg: string;
  assistantMsg: string;
  imageSrc?: string;
  onDelete: () => void;
}

const MessageEntry: React.FC<MessageEntryProps> = ({
  date,
  userMsg,
  assistantMsg,
  imageSrc,
  onDelete
}) => (
  <TextEntry date={date} onDelete={onDelete}>
    <Grid>
      {imageSrc && (
        <Grid.Col span={{ xs: 12, sm: 4, md: 3 }}>
          <Paper
            component="img"
            src={imageSrc}
            withBorder
            w="100%"
          />
        </Grid.Col>
      )}
      <Grid.Col span={{ xs: 12, sm: 8, md: 9 }}>
        <Title order={3} size="sm">User Speech</Title>
        <Spoiler>
          <Text fs="italic">{userMsg}</Text>
        </Spoiler>
        <Space h="md" />
        <Title order={3} size="sm">Assistant Response</Title>
        <Spoiler>
          <Text>{assistantMsg}</Text>
        </Spoiler>
      </Grid.Col>
    </Grid>
  </TextEntry>
);

export default MessageEntry;