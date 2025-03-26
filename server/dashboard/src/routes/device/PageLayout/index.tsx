import { Box, SegmentedControl, Transition } from "@mantine/core";
import { ReactNode, useState, useEffect } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import clsx from "clsx";
import classes from "./PageLayout.module.css";
import DashboardLayout from "../../../layouts/DashboardLayout";

interface PageLayoutProps {
  // We’re not accepting a verticallyCentered prop anymore,
  // since we’re computing it based on the URL.
  children?: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract the current tab from the URL.
  // Assumes a path like "/devices/:tab"
  const pathSegments = location.pathname.split("/");
  const currentTab = pathSegments[pathSegments.length - 1] || "overview";

  // If the current tab is "overview", enable vertical centering.
  const verticallyCentered = currentTab.toLowerCase() === "overview";

  // Define your tabs with label and value.
  const tabs = [
    { label: "Overview", value: "overview" },
    { label: "Captures", value: "captures" },
    { label: "Notes", value: "notes" },
    { label: "Messages", value: "messages" },
    { label: "Settings", value: "settings" },
  ];

  // State to handle the animated transition.
  const [displayLocation, setDisplayLocation] = useState(location);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    // When the route changes, fade out, update, then fade in.
    setMounted(false);
    const timeoutId = setTimeout(() => {
      setDisplayLocation(location);
      setMounted(true);
    }, 300); // transition duration
    return () => clearTimeout(timeoutId);
  }, [location]);

  return (
    <DashboardLayout title="Home">
      <Box className={classes.pageContainer}>
        <Box className={classes.verticalContainer}>
          <SegmentedControl
            size="lg"
            radius="xl"
            data={tabs}
            value={currentTab}
            onChange={(val: string) => navigate(`/devices/${val}`)}
            withItemsBorders={false}
          />
        </Box>
        <Box className={clsx(classes.contentContainer, verticallyCentered && classes.contentCentered)}>
          <Transition transition="fade" duration={300} mounted={mounted}>
            {(styles) => (
              <div style={styles}>
                <Outlet key={displayLocation.key} />
              </div>
            )}
          </Transition>
        </Box>
        {verticallyCentered && (
          <Box className={clsx(classes.verticalContainer, classes.bottomContainer)} />
        )}
      </Box>
    </DashboardLayout>
  );
};

export default PageLayout;
