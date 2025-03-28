import { Grid } from "@mantine/core";
import TabContainer from "../../components/TabContainer";
import ImageEntry from "../../components/ImageEntry";
import testImg from "src/assets/testimg.jpg";

const Captures: React.FC = () => {
  const count = 20;

  return (
    <TabContainer paper={false}>
      <Grid>
        {Array.from({ length: count }).map((_) => (
          <ImageEntry
            src={testImg}
            onDownload={() => { }}
            onDelete={() => { }}
          />
        ))}
      </Grid>
    </TabContainer>
  )
};

export default Captures;