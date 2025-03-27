import { useParams } from "react-router-dom";
import DashboardLayout from "src/layouts/DashboardLayout";
import TabLayout, { TabDefinition } from "./TabLayout/TabLayout";
import Overview from "./tabs/Overview";
import Captures from "src/routes/Device/tabs/Captures";
import Notes from "src/routes/Device/tabs/Notes";
import Messages from "src/routes/Device/tabs/Messages";
import Settings from "src/routes/Device/tabs/Settings";
import NotFound from "src/routes/NotFound";
import { selectDeviceNames } from "src/state/slices/settingsSlice";
import { useAppSelector } from "src/state/hooks";

const tabs: TabDefinition[] = [
  { label: "Overview", value: "overview", fullScreen: true, Component: Overview },
  { label: "Captures", value: "captures", Component: Captures },
  { label: "Notes", value: "notes", Component: Notes },
  { label: "Messages", value: "messages", Component: Messages },
  { label: "Settings", value: "settings", Component: Settings },
];

const PageLayout: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();

  const deviceNames = useAppSelector(selectDeviceNames);

  if (!deviceId || !deviceNames[deviceId]) {
    return <NotFound />;
  }

  return (
    <DashboardLayout title={deviceNames[deviceId]}>
      <TabLayout tabs={tabs} />
    </DashboardLayout>
  );
};

export default PageLayout;
