import {
  Box,
  Button,
  Grid,
  Paper,
  PasswordInput,
  ScrollArea,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { WifiNetwork } from "../../../state/slices/settingsSlice";

import NetworkTable from "./NetworkTable";
import SettingsCol from "../../components/SettingsCol";
import _ from "lodash";
import { appAlert, appConfirm } from "../../../modals";
import useBindSettings from "../../useBindSettings";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

const MAX_NETWORK_COUNT = 10;

const WiFi = () => {
  const { value: wifiNetworks, onChange: setWifiNetworks } =
    useBindSettings()("wifiNetworks");

  const {
    register: registerWifiField,
    handleSubmit: handleAddNetwork,
    reset: clearWifiForm,
  } = useForm<WifiNetwork>();

  const onNetworkAdd = useCallback(
    async (network: WifiNetwork) => {
      if (wifiNetworks.length >= MAX_NETWORK_COUNT) {
        appAlert(
          "Saved Network Limit Reached",
          "Please remove a network in order to save this one."
        );
        return;
      }

      const newNetworks = _.clone(wifiNetworks);
      newNetworks.push(network);
      setWifiNetworks(newNetworks);
      clearWifiForm();
    },
    [setWifiNetworks, wifiNetworks]
  );

  const handleNetworkRemove = useCallback(
    (index: number) => async () => {
      await appConfirm(
        "Confirm Delete",
        "Are you sure you want to delete this network?"
      );

      const newNetworks = _.clone(wifiNetworks);
      newNetworks.splice(index, 1);
      setWifiNetworks(newNetworks);
    },
    [setWifiNetworks, wifiNetworks]
  );

  return (
    <Grid>
      <SettingsCol>
        <form onSubmit={handleAddNetwork(onNetworkAdd)}>
          <Title order={4}>Add a Network</Title>
          <Stack align="start">
            <TextInput
              label="SSID"
              maxLength={32}
              {...registerWifiField("ssid", { required: true })}
            />
            <PasswordInput
              label="Password"
              maxLength={63}
              {...registerWifiField("password")}
            />
            <Button type="submit">Add Network</Button>
          </Stack>
        </form>
      </SettingsCol>
      <SettingsCol>
        <Box>
          <Title order={4}>Saved Networks</Title>
          <Paper withBorder>
            <ScrollArea h={150}>
              <NetworkTable
                wifiNetworks={wifiNetworks}
                onRemove={handleNetworkRemove}
              />
            </ScrollArea>
          </Paper>
        </Box>
      </SettingsCol>
    </Grid>
  );
};

export default WiFi;
