import { Stack } from "@mantine/core";
import TabContainer from "../../components/TabContainer";
import TextEntry from "../../components/TextEntry";
import Spoiler from "src/components/Spoiler";

const lorem =
  `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras et leo magna. In nec lorem auctor, molestie orci sed, tincidunt dolor. Ut blandit at leo et ullamcorper. Etiam nec euismod sem. Nulla molestie in lacus vitae aliquam. Vivamus ornare velit non nulla ullamcorper, a egestas risus vestibulum. Morbi malesuada dictum erat, sit amet vulputate massa ornare id. Sed convallis nisi sed neque ultrices eleifend. Nam sollicitudin pulvinar massa, ac condimentum nibh auctor a. Vivamus tincidunt nunc quis nulla faucibus lacinia. Nulla molestie nisi ac dolor lobortis rhoncus.

Suspendisse dapibus pulvinar massa, in mattis enim ullamcorper et. Morbi vulputate, est quis bibendum lacinia, tortor risus porttitor sapien, vitae consequat orci ante at neque. Etiam eu hendrerit nisl. In eu magna quis urna congue interdum. Phasellus sodales pretium tortor. Mauris diam sem, luctus ut fringilla eget, tempus ac lacus. Proin maximus, purus iaculis accumsan viverra, velit ligula consectetur arcu, quis rhoncus diam sem eget justo. Quisque at eleifend dui, vel mollis velit. Curabitur consequat nisi non felis tristique, non interdum elit sollicitudin. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed tincidunt faucibus quam sed maximus. Aliquam erat volutpat.
`;

const Notes: React.FC = () => {
  const count = 20;

  return (
    <TabContainer paper={true}>
      <Stack gap="xl">
        {Array.from({ length: count }).map((_) => (
          <TextEntry title="Title" date={new Date()} onDelete={() => { }}>
            <Spoiler>
              {lorem}
            </Spoiler>
          </TextEntry>
        ))}
      </Stack>
    </TabContainer>
  )
};

export default Notes;