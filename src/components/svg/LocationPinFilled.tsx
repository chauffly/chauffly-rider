import { Circle, Path, Svg } from 'react-native-svg';

interface LocationPinFilledProps {
  size?: number;
  color?: string;
  dotColor?: string;
}

const LocationPinFilled = ({ size = 24, color = '#43A047', dotColor = '#FFFFFF' }: LocationPinFilledProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
        fill={color}
      />
      <Circle
        cx="12"
        cy="9"
        r="2.5"
        fill={dotColor}
      />
    </Svg>
  );
};

export default LocationPinFilled;
