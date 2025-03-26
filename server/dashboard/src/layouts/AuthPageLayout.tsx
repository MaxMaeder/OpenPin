import { ReactNode } from 'react';
import { Center, Stack, Image, Paper, Button, Group } from '@mantine/core';
import BaseLayout from './BaseLayout';
import Logo from '../assets/logo.svg';
import { NavLink, To } from 'react-router-dom';

interface AuthLink {
  href: To;
  label: string;
}

interface AuthPageLayoutProps {
  title: string;
  children: ReactNode;
  links?: AuthLink[];
}

const AuthPageLayout = ({ title, children, links }: AuthPageLayoutProps) => {
  return (
    <BaseLayout title={title}>
      <Center h="100%">
        <Stack align="center" gap="lg">
          <Image src={Logo} w="150px" />
          <Paper p="lg" withBorder>
            {children}
            {links &&
              <Group mt="lg" gap={0} justify="center">
                {links.map((link) => (
                  <Button variant="transparent" component={NavLink} to={link.href}>{link.label}</Button>
                ))}
              </Group>
            }
          </Paper>
        </Stack>
      </Center>
    </BaseLayout>
  );
};

export default AuthPageLayout;