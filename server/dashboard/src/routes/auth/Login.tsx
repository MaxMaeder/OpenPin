import { Stack, Text, TextInput, PasswordInput, Button } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import AuthLayout from 'src/layouts/AuthLayout.tsx';
import { auth } from 'src/comm/firebase.ts';

type LoginFormInputs = {
  email: string;
  password: string;
};

const LoginRoute = () => {
  const { register, handleSubmit } = useForm<LoginFormInputs>();
  const [signInWithEmailAndPassword, _, loading, error] =
    useSignInWithEmailAndPassword(auth);

  const onSubmit = (data: LoginFormInputs) => {
    signInWithEmailAndPassword(data.email, data.password);
  };

  return (
    <AuthLayout
      title="Log In"
      links={[{
        label: "Create Account",
        href: "/auth/signup",
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
          <Button type="submit" loading={loading} mt="xs">
            Log In
          </Button>
          {error && <Text c="red">{error.message}</Text>}
        </Stack>
      </form>
    </AuthLayout>
  );
};

export default LoginRoute;
