import { Stack, Text, TextInput, Button } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { useSendPasswordResetEmail } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import AuthLayout from 'src/layouts/AuthLayout.tsx';
import { auth } from 'src/comm/firebase.ts';
import { notifications } from '@mantine/notifications';
import { emailValidation } from './common';

type ResetFormInputs = {
  email: string;
};

const ResetPasswordRoute = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormInputs>();
  const [sendPasswordResetEmail, sending, fbError] = useSendPasswordResetEmail(auth);

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
          <Button type="submit" loading={sending} mt="xs">
            Reset Password
          </Button>
          {fbError && <Text c="red">{fbError.message}</Text>}
        </Stack>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordRoute;
