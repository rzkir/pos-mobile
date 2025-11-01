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

interface HeaderGradientProps {
  colors?: [string, string, ...string[]];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: ViewStyle;
  icon?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}
