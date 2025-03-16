import users from "../keys/dashUsers";

export interface DashUser {
  username: string;
}

const getUser = (username: string): DashUser => ({
  username,
});

const authUser = (username: string, password: string): DashUser | undefined => {
  const dbUser =
      users.find((u) => u.username === username && u.password === password);

  if (!dbUser) return;

  return getUser(dbUser.username);
};

export { getUser, authUser };
