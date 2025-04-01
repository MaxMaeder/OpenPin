import { Stack, Text, TextInput, PasswordInput, Button } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import AuthLayout from 'src/layouts/AuthLayout.tsx';
import { auth } from 'src/comm/firebase.ts';
import { emailValidation } from './common';

type SignupFormInputs = {
  email: string;
  password: string;
  confirmPassword: string;
};

const SignupRoute = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormInputs>();
  const [createUserWithEmailAndPassword, _, loading, fbError] =
    useCreateUserWithEmailAndPassword(auth);

  const onSubmit = (data: SignupFormInputs) => {
    createUserWithEmailAndPassword(data.email, data.password);
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
                value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
                message: 'Password must contain a number and be at least 8 characters.',
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
          <Button type="submit" loading={loading} mt="xs">
            Create Account
          </Button>
          {fbError && <Text c="red">{fbError.message}</Text>}
        </Stack>
      </form>
    </AuthLayout>
  );
};

export default SignupRoute;
