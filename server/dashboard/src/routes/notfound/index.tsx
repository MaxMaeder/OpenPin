import { Button, Center, Image, Stack, Title } from "@mantine/core";

import BaseLayout from "../../layouts/BaseLayout";
import { Link } from "react-router-dom";
import Logo from "../../assets/logo.svg";

const NotFoundRoute = () => {
  return (
    <BaseLayout title="Not Found">
      <Center h="100%">
        <Stack align="center" gap="lg">
          <Image src={Logo} w="150px" />
          <Stack align="center">
            <Title order={1}>Page Not Found</Title>
            <Button variant="default" component={Link} to="/">
              Go Home
            </Button>
          </Stack>
        </Stack>
      </Center>
    </BaseLayout>
  );
};

export default NotFoundRoute;
