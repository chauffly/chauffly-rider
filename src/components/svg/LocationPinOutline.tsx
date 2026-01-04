import { Circle, Path, Svg } from 'react-native-svg';

interface LocationPinOutlineProps {
  size?: number;
  color?: string;
}

const LocationPinOutline = ({ size = 24, color = '#212121' }: LocationPinOutlineProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx="12"
        cy="9"
        r="3"
        stroke={color}
        strokeWidth="2"
      />
    </Svg>
  );
};

export default LocationPinOutline;
