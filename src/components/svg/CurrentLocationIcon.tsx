import { Circle, Path, Svg } from 'react-native-svg';

interface CurrentLocationIconProps {
  size?: number;
  color?: string;
}

const CurrentLocationIcon = ({ size = 24, color = '#212121' }: CurrentLocationIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="12"
        r="8"
        stroke={color}
        strokeWidth="2"
      />
      <Circle
        cx="12"
        cy="12"
        r="3"
        fill={color}
      />
      <Path
        d="M12 2V4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M12 20V22"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M2 12H4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M20 12H22"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default CurrentLocationIcon;
