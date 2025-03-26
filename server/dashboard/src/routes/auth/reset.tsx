import React from 'react';
import { Stack, Text, TextInput, Button } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { useSendPasswordResetEmail } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import AuthPageLayout from '../../layouts/AuthPageLayout.tsx';
import { auth } from '../../comm/firebase.ts';
import { notifications } from '@mantine/notifications';

type ResetFormInputs = {
  email: string;
};

const ResetPasswordRoute: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<ResetFormInputs>();
  const [sendPasswordResetEmail, sending, error] = useSendPasswordResetEmail(auth);

  const onSubmit = async (data: ResetFormInputs) => {
    const success = await sendPasswordResetEmail(data.email);
    if (success) {
      notifications.show({
        title: "Password Reset Sent",
        message: "Check your email for a link to reset your password.",
        position: "top-right"
      })
      navigate("/auth/login");
    }
  };

  return (
    <AuthPageLayout
      title="Reset Password"
      links={[{
        label: "Log In",
        href: "/auth/login",
      }, {
        label: "Create Account",
        href: "/auth/signup",
      }]}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <TextInput
            label="Email"
            placeholder="you@example.com"
            {...register('email', { required: true })}
          />
          <Button type="submit" loading={sending} mt="xs">
            Reset Password
          </Button>
          {error && <Text c="red">{error.message}</Text>}
        </Stack>
      </form>
    </AuthPageLayout>
  );
};

export default ResetPasswordRoute;
