import { Box, SegmentedControl } from "@mantine/core";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import classes from "./TabLayout.module.css";
import NotFound from "../../NotFound";

export interface TabDefinition {
  label: string;
  value: string;
  fullScreen?: boolean;
  Component: React.FC;
}

interface TabLayoutProps {
  tabs: TabDefinition[];
  animationDuration?: number;
}

const TabLayout: React.FC<TabLayoutProps> = ({ tabs, animationDuration: duration = 0.15 }) => {
  const { deviceId, tab: tabParam } = useParams<{ deviceId: string; tab: string }>();
  const navigate = useNavigate();

  const activeTab = tabs.find(tab => tab.value === tabParam);
  if (!tabParam || !activeTab) return <NotFound />;

  const [displayTab, setDisplayTab] = useState(activeTab);

  useEffect(() => {
    // Update displayed tab after the exit animation duration.
    const timeout = setTimeout(() => {
      setDisplayTab(activeTab);
    }, duration * 1000);
    return () => clearTimeout(timeout);
  }, [activeTab, duration]);

  const verticallyCentered = displayTab.fullScreen ?? false;

  const onTabChange = (val: string) => {
    if (deviceId) {
      navigate(`/${deviceId}/${val}`);
    }
  };

  return (
    <Box className={classes.pageContainer}>
      <Box className={classes.verticalContainer}>
        <SegmentedControl
          size="lg"
          radius="xl"
          data={tabs.map(({ label, value }) => ({ label, value }))}
          value={activeTab.value}
          onChange={onTabChange}
          withItemsBorders={false}
        />
      </Box>

      <Box className={classes.contentWrapper}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration }}
            className={classes.animationContainer}
          >
            <Box className={clsx(classes.contentContainer, verticallyCentered && classes.contentCentered)}>
              <displayTab.Component />
            </Box>

            {verticallyCentered && (
              <Box className={clsx(classes.verticalContainer, classes.bottomContainer)} />
            )}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default TabLayout;
