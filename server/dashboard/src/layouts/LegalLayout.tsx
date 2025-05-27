import { ReactNode } from 'react';
import { Stack, Image, Paper, Anchor } from '@mantine/core';
import BaseLayout from './BaseLayout';
import Logo from 'src/assets/logo.svg';
import { Link } from 'react-router-dom';

interface LegalLayoutProps {
  title: string;
  children: ReactNode;
}

const LegalLayout = ({ title, children }: LegalLayoutProps) => (
  <BaseLayout title={title}>
    <Stack align="center" gap="lg" mx="lg" my="xl">
      <Anchor component={Link} to="/">
        <Image src={Logo} w="150px" />
      </Anchor>
      <Paper p="lg" withBorder >
        {children}
      </Paper>
    </Stack>
  </BaseLayout>
);

export default LegalLayout;