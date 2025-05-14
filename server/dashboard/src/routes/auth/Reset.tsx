import { Stack, Text, TextInput, Button } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import AuthLayout from 'src/layouts/AuthLayout.tsx';
import { notifications } from '@mantine/notifications';
import { emailValidation } from './common';
import { useAuth } from 'src/state/hooks';
import { useEffect } from 'react';

type ResetFormInputs = {
  email: string;
};

const ResetPasswordRoute = () => {
  const { resetPassword, clearError, status, error: apiErr } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormInputs>();

  useEffect(() => {
    clearError();
  }, []);

  const onSubmit = async (data: ResetFormInputs) => {
    await resetPassword(data.email);
    notifications.show({
      title: "Password Reset Sent",
      message: "Check your email for a link to reset your password.",
      position: "top-right"
    })
    navigate("/auth/login");
  };

  return (
    <AuthLayout
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
            error={errors.email?.message}
            {...register('email', emailValidation)}
          />
          <Button type="submit" loading={status == "loading"} mt="xs">
            Reset Password
          </Button>
          {apiErr && <Text c="red">{apiErr}</Text>}
        </Stack>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordRoute;
