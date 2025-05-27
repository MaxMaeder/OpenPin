import React, { ReactNode } from 'react';
import { Center, Stack, Image, Paper, Button, Group } from '@mantine/core';
import BaseLayout from './BaseLayout';
import Logo from 'src/assets/logo.svg';
import { NavLink, To, useLocation } from 'react-router-dom';

interface AuthLink {
  href: To;
  label: string;
}

interface AuthPageLayoutProps {
  title: string;
  children: ReactNode;
  links?: AuthLink[];
}

const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({ title, children, links }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get("redirectTo");

  return (
    <BaseLayout title={title}>
      <Center h="100%">
        <Stack align="center" gap="lg">
          <Image src={Logo} w="150px" />
          <Paper p="lg" withBorder>
            {children}
            {links && (
              <Group mt="lg" gap={0} justify="center">
                {links.map((link) => {
                  const fullHref = redirectTo
                    ? `${link.href}?redirectTo=${encodeURIComponent(redirectTo)}`
                    : link.href;

                  return (
                    <Button
                      key={link.href.toString()}
                      variant="transparent"
                      component={NavLink}
                      to={fullHref}
                    >
                      {link.label}
                    </Button>
                  );
                })}
              </Group>
            )}
          </Paper>
        </Stack>
      </Center>
      <Group mb="sm" gap="0" justify="center" style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0
      }} >
        <Button
          variant="transparent"
          color="gray"
          component={NavLink}
          to="/legal/terms"
        >
          Terms of Service
        </Button>
        <Button
          variant="transparent"
          color="gray"
          component={NavLink}
          to="/legal/terms"
        >
          Privacy Policy
        </Button>
      </Group>
    </BaseLayout>
  );
};

export default AuthPageLayout;