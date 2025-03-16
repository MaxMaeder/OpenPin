import {
  IconCode,
  IconMessages,
  IconSettings,
  IconWifi,
} from "@tabler/icons-react";

import ConversationsTab from "./tabs/Conversations";
import FirmwareTab from "./tabs/Firmware";
import GeneralTab from "./tabs/General";
import WifiTab from "./tabs/Wifi";

const tabs = [
  {
    icon: IconSettings,
    id: "general",
    title: "General",
    content: GeneralTab,
  },
  {
    icon: IconMessages,
    id: "history",
    title: "Prompts and Conversations",
    content: ConversationsTab,
  },
  {
    icon: IconWifi,
    id: "wifi",
    title: "Wifi Networks",
    content: WifiTab,
  },
  {
    icon: IconCode,
    id: "firmware",
    title: "Firmware",
    content: FirmwareTab,
  },
];

export default tabs;
