import { Circle, Path, Svg } from 'react-native-svg';

interface ClockIconProps {
  size?: number;
  color?: string;
}

const ClockIcon = ({ size = 24, color = '#212121' }: ClockIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="12"
        r="9"
        stroke={color}
        strokeWidth="2"
      />
      <Path
        d="M12 7V12L15 15"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default ClockIcon;
