import { useMediaQuery } from "@mantine/hooks";

const useIsMobile = () => useMediaQuery("(max-width: 576px)");

export default useIsMobile;
