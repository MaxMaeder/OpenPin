import {
  FileInput,
  PasswordInput,
  Slider,
  TextInput,
  createTheme,
} from "@mantine/core";

export const theme = createTheme({
  components: {
    TextInput: TextInput.extend({
      defaultProps: {
        style: {
          width: 300,
        },
      },
    }),
    PasswordInput: PasswordInput.extend({
      defaultProps: {
        style: {
          width: 300,
        },
      },
    }),
    FileInput: FileInput.extend({
      defaultProps: {
        style: {
          width: 300,
        },
      },
    }),
    Slider: Slider.extend({
      defaultProps: {
        style: {
          maxWidth: 400,
        },
      },
    }),
  },
  primaryColor: "brand",
  colors: {
    dark: [
      "#ffffff", // Text color
      "#EDEDED",
      "#DBDBDB",
      "#464646",
      "#3A3A3A",
      "#2F2F2F",
      "#232323",
      "#171717",
      "#0C0C0C",
      "#000000",
    ],
    brand: [
      "#eef3ff",
      "#dce4f5",
      "#b9c7e2",
      "#94a8d0",
      "#748dc1",
      "#5f7cb8",
      "#5474b4",
      "#44639f",
      "#39588f",
      "#2d4b81",
    ],
  },
});
