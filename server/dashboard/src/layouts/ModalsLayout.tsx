import { ModalsProvider } from "@mantine/modals";
import { Outlet } from "react-router-dom";
import PairModal from "src/modals/PairModal";

const ModalsLayout = () => {
  return (
    <ModalsProvider modals={{ pair: PairModal }}>
      <Outlet />
    </ModalsProvider>
  );
}

export default ModalsLayout;
