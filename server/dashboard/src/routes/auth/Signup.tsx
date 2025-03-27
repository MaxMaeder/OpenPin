import { Stack, Text, TextInput, PasswordInput, Button } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import AuthPageLayout from '../../layouts/AuthPageLayout.tsx';
import { auth } from '../../comm/firebase.ts';

type SignupFormInputs = {
  email: string;
  password: string;
  confirmPassword: string;
};

const SignupRoute = () => {
  const { register, handleSubmit } = useForm<SignupFormInputs>();
  const [createUserWithEmailAndPassword, _, loading, error] =
    useCreateUserWithEmailAndPassword(auth);

  const onSubmit = (data: SignupFormInputs) => {
    createUserWithEmailAndPassword(data.email, data.password);
  };

  return (
    <AuthPageLayout
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
            {...register('email', { required: true })}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            {...register('password', { required: true })}
          />
          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm your password"
            {...register('confirmPassword', { required: true })}
          />
          <Button type="submit" loading={loading} mt="xs">
            Create Account
          </Button>
          {error && <Text c="red">{error.message}</Text>}
        </Stack>
      </form>
    </AuthPageLayout>
  );
};

export default SignupRoute;
