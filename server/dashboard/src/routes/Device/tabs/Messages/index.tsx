import { Stack } from "@mantine/core";
import TabContainer from "../../components/TabContainer";
import MessageEntry from "./MessageEntry";
import testImg from "src/assets/testimg.jpg";

const Messages: React.FC = () => {
  const count = 20;

  return (
    <TabContainer paper={true}>
      <Stack gap="xl">
        {Array.from({ length: count }).map((_, i) => (
          <MessageEntry
            date={new Date()}
            userMsg="My message content"
            assistantMsg="Assistant message content"
            imageSrc={i % 3 == 0 ? testImg : undefined}
            onDelete={() => { }}
          />
        ))}
      </Stack>
    </TabContainer>
  )
};

export default Messages;