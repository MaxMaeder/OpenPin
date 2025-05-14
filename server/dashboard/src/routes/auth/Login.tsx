import { Stack, Text, TextInput, PasswordInput, Button } from '@mantine/core';
import { useForm } from 'react-hook-form';
import AuthLayout from 'src/layouts/AuthLayout.tsx';
import { emailValidation } from './common';
import { useAuth } from 'src/state/hooks';
import { useEffect } from 'react';

type LoginFormInputs = {
  email: string;
  password: string;
};

const LoginRoute = () => {
  const { login, clearError, status, error: apiErr } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();

  useEffect(() => {
    clearError();
  }, []);

  const onSubmit = (data: LoginFormInputs) => {
    login(data.email, data.password);
  };

  const simpleAuth = import.meta.env.DASH_SIMPLE_AUTH;
  const links = !simpleAuth ? [
    { label: "Create Account", href: "/auth/signup" },
    { label: "Forgot Password?", href: "/auth/reset" },
  ] : undefined;

  return (
    <AuthLayout
      title="Log In"
      links={links}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <TextInput
            label="Email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email', emailValidation)}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            error={errors.password?.message}
            {...register('password', { required: true })}
          />
          <Button type="submit" loading={status == "loading"} mt="xs">
            Log In
          </Button>
          {apiErr && <Text c="red">{apiErr}</Text>}
        </Stack>
      </form>
    </AuthLayout>
  );
};

export default LoginRoute;
