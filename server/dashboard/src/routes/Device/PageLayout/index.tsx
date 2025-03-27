import { useParams } from "react-router-dom";
import DashboardLayout from "../../../layouts/DashboardLayout";
import TabLayout, { TabDefinition } from "./TabLayout";
import Overview from "../tabs/Overview";
import Captures from "../tabs/Captures";
import Notes from "../tabs/Notes";
import Messages from "../tabs/Messages";
import Settings from "../tabs/Settings";
import NotFound from "../../NotFound";
import { selectDeviceNames } from "../../../state/slices/settingsSlice";
import { useAppSelector } from "../../../state/hooks";

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
