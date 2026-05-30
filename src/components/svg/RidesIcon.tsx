import Svg, { Path, Circle } from 'react-native-svg';

interface RidesIconProps {
  size?: number;
  color?: string;
}

export default function RidesIcon({
  size = 24,
  color = '#000000'
}: RidesIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Circular arrow with gap at bottom right */}
      <Path
        d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 14.5 19 16.5 17.5 18"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Arrow head pointing left */}
      <Path
        d="M4 12L2 10M4 12L2 14"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Location pin at bottom right - overlapping the circle */}
      <Path
        d="M19 15.5C17.9 15.5 17 16.4 17 17.5C17 19.5 19 22 19 22C19 22 21 19.5 21 17.5C21 16.4 20.1 15.5 19 15.5Z"
        fill={color}
      />
      <Circle
        cx="19"
        cy="17.5"
        r="1.2"
        fill="white"
      />
    </Svg>
  );
}
