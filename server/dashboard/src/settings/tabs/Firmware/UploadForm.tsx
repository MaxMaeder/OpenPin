import { Button, FileInput, Stack, Text, rem } from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
import api, { ApiError } from "../../../comm/api";
import { useCallback, useState } from "react";

import { IconFile } from "@tabler/icons-react";
import { selectSelectedDevice } from "../../../state/slices/devSelectSlice";
import { useAppSelector } from "../../../state/hooks";

type FirmwareUpload = {
  file: File;
};

const UploadForm = () => {
  const deviceId = useAppSelector(selectSelectedDevice)!;

  const [isLoading, setLoading] = useState(false);
  const {
    handleSubmit,
    control,
    clearErrors,
    reset,
    setError,
    formState: { errors: errors },
  } = useForm<FirmwareUpload>();

  const onUpload = useCallback(
    async (upload: FirmwareUpload) => {
      clearErrors();
      setLoading(true);
      try {
        await api.uploadFirmware(deviceId, upload.file);
        reset();
      } catch (error) {
        setError("root", { message: (error as ApiError).message });
      }
      setLoading(false);
    },
    [deviceId]
  );

  const fileIcon = (
    <IconFile style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
  );

  return (
    <form onSubmit={handleSubmit(onUpload)}>
      <Stack align="start">
        <Controller
          control={control}
          name={"file"}
          rules={{ required: true }}
          render={({ field }) => {
            return (
              <FileInput
                {...field}
                label="Step #1: Upload Firmware Binary"
                placeholder="Select..."
                leftSection={fileIcon}
                leftSectionPointerEvents="none"
              />
            );
          }}
        />
        <Button type="submit" loading={isLoading}>
          Upload File
        </Button>
        {errors.root && <Text c="red">{errors.root.message}</Text>}
      </Stack>
    </form>
  );
};

export default UploadForm;
