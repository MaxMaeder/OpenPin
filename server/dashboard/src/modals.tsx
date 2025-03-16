import { Text } from "@mantine/core";
import { modals } from "@mantine/modals";

const appAlert = (title: string, message: string) => {
  return new Promise((resolve) => {
    modals.openConfirmModal({
      title,
      children: <Text size="sm">{message}</Text>,
      labels: { confirm: "Ok", cancel: "Ok" },
      cancelProps: {
        display: "none",
      },
      onCancel: () => resolve("User acknowledged"),
      onConfirm: () => resolve("User acknowledged"),
    });
  });
};

const appConfirm = (title: string, message: string) => {
  return new Promise((resolve, reject) => {
    modals.openConfirmModal({
      title,
      children: <Text size="sm">{message}</Text>,
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onCancel: () => reject("User canceled"),
      onConfirm: () => resolve("User confirmed"),
    });
  });
};

export { appAlert, appConfirm };
