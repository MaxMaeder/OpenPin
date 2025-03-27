import { Box, Flex, Title, Divider, Grid } from "@mantine/core";
import { ReactNode } from "react";

interface SectionProps {
  title: String;
  children: ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => {
  return (
    <Box>
      <Flex w="100%" align="center" mb="sm">
        <Title order={2} size="md" mr="md">{title}</Title>
        <Box flex={1}>
          <Divider color="white" size="sm" />
        </Box>
      </Flex>
      <Grid>
        {children}
      </Grid>
    </Box>
  )
}

export default Section;