interface TabConfig {
  name: string;
  icon: string;
  iconType: "ionicons" | "antdesign";
}

interface DynamicTabsProps {
  tabs: string[];
  tabConfigs: Record<string, TabConfig>;
}

interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  onSelect: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

interface BottomSheetProps {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxHeightPercent?: number;
  showCloseButton?: boolean;
  enableSwipeToClose?: boolean;
}
