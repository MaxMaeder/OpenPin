import { useParams } from "react-router-dom";
import DashboardLayout from "src/layouts/DashboardLayout";
import TabLayout, { TabDefinition } from "./components/TabLayout/TabLayout";
import Overview from "./tabs/Overview";
import Captures from "./tabs/Captures";
import Notes from "./tabs/Notes";
import Messages from "./tabs/Messages";
import Settings from "./tabs/Settings";
import NotFound from "src/routes/NotFound";
import { selectDeviceNames } from "src/state/slices/settingsSlice";
import { useAppSelector } from "src/state/hooks";
import { selectIsLoaded } from "src/state/slices/commSlice";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "src/comm/firebase";
import LoadingPlaceholder from "src/components/LoadingPlaceholder";

const tabs: TabDefinition[] = [
  { label: "Overview", value: "overview", fullScreen: true, Component: Overview },
  { label: "Captures", value: "captures", Component: Captures },
  { label: "Notes", value: "notes", Component: Notes },
  { label: "Messages", value: "messages", Component: Messages },
  { label: "Settings", value: "settings", Component: Settings },
];

const PageLayout: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();

  const [user] = useAuthState(auth);

  const deviceNames = useAppSelector(selectDeviceNames);
  const isLoaded = useAppSelector(selectIsLoaded);

  const displayTabs = user && isLoaded;

  if (!deviceId || (displayTabs && !deviceNames[deviceId])) {
    return <NotFound />;
  }

  return (
    <DashboardLayout title={deviceNames[deviceId] || "Loading..."}>
      {displayTabs ?
        (<TabLayout tabs={tabs} />) :
        (<LoadingPlaceholder message="Loading Device" />)}
    </DashboardLayout>
  );
};

export default PageLayout;
