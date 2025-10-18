interface TabConfig {
  name: string;
  icon: string;
  iconType: "ionicons" | "antdesign";
}

interface DynamicTabsProps {
  tabs: string[];
  tabConfigs: Record<string, TabConfig>;
}
