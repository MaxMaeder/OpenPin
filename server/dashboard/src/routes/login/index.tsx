import {
  Button,
  Center,
  Image,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import {
  UserCredentials,
  loginUser,
  selectAuthError,
  selectIsAuthenticated,
  selectIsAuthenticating,
} from "../../state/slices/userSlice";
import { useAppDispatch, useAppSelector } from "../../state/hooks";

import BaseLayout from "../../layouts/BaseLayout";
import Logo from "../../assets/logo.svg";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const LoginRoute = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<UserCredentials>();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAuthenticating = useAppSelector(selectIsAuthenticating);
  const errorMessage = useAppSelector(selectAuthError);

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [navigate, isAuthenticated]);

  const onSubmit = (creds: UserCredentials) => {
    dispatch(loginUser(creds));
  };

  return (
    <BaseLayout title="Log In">
      <Center h="100%">
        <Stack align="center" gap="lg">
          <Image src={Logo} w="150px" />
          <Paper p="lg" withBorder>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack>
                <TextInput
                  w="300px"
                  placeholder="Username"
                  {...register("username", { required: true })}
                />
                <PasswordInput
                  placeholder="Password"
                  {...register("password", { required: true })}
                />
                <Button type="submit" loading={isAuthenticating}>
                  Log In
                </Button>
                {errorMessage && <Text c="red">{errorMessage}</Text>}
              </Stack>
            </form>
          </Paper>
        </Stack>
      </Center>
    </BaseLayout>
  );
};

export default LoginRoute;
