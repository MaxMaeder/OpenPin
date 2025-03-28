import { Text } from "@mantine/core";
import { modals } from "@mantine/modals";

const openAlertModal = (title: string, message: string) => {
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

const openConfirmModal = (title: string, message: string) => {
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

const openPairModal = () => {
  modals.openContextModal({
    modal: "pair",
    title: "Pair Device",
    innerProps: {}
  });
}

export { openAlertModal, openConfirmModal, openPairModal };
