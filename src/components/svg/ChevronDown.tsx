import { Path, Svg } from 'react-native-svg';

interface ChevronDownProps {
  size?: number;
  color?: string;
}

const ChevronDown = ({ size = 20, color = '#757575' }: ChevronDownProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M5 7.5L10 12.5L15 7.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default ChevronDown;
