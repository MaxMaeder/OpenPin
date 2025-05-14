import { Stack, Text, TextInput, PasswordInput, Button } from '@mantine/core';
import { useForm } from 'react-hook-form';
import AuthLayout from 'src/layouts/AuthLayout.tsx';
import { emailValidation } from './common';
import { useAuth } from 'src/state/hooks';
import { useEffect } from 'react';

type SignupFormInputs = {
  email: string;
  password: string;
  confirmPassword: string;
};

const SignupRoute = () => {
  const { signup, clearError, status, error: apiErr } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormInputs>();

  useEffect(() => {
    clearError();
  }, []);

  const onSubmit = (data: SignupFormInputs) => {
    signup(data.email, data.password);
  };

  const password = watch('password');

  return (
    <AuthLayout
      title="Create Account"
      links={[{
        label: "Log In",
        href: "/auth/login",
      }, {
        label: "Forgot Password?",
        href: "/auth/reset",
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
          <PasswordInput
            label="Password"
            placeholder="Your password"
            error={errors.password?.message}
            {...register('password', {
              required: true,
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                message: 'Password must contain a uppercase & lowercase letter, number and be at least 8 characters.',
              }
            })}
          />
          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm your password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: true,
              validate: (value) =>
                value === password || 'Passwords do not match',
            })}
          />
          <Button type="submit" loading={status == "loading"} mt="xs">
            Create Account
          </Button>
          {apiErr && <Text c="red">{apiErr}</Text>}
        </Stack>
      </form>
    </AuthLayout>
  );
};

export default SignupRoute;
