import Svg, { Path } from 'react-native-svg';

interface CarIconProps {
  size?: number;
  color?: string;
}

export default function CarIcon({ 
  size = 24, 
  color = '#000000' 
}: CarIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path 
        d="M17.5 5H6.5C5.67 5 4.96 5.55 4.76 6.32L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L19.24 6.32C19.04 5.55 18.33 5 17.5 5ZM6.85 7H17.15L18.15 10H5.85L6.85 7ZM19 17H5V12H19V17Z" 
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path 
        d="M7.5 15.5C8.05228 15.5 8.5 15.0523 8.5 14.5C8.5 13.9477 8.05228 13.5 7.5 13.5C6.94772 13.5 6.5 13.9477 6.5 14.5C6.5 15.0523 6.94772 15.5 7.5 15.5Z" 
        fill={color}
      />
      <Path 
        d="M16.5 15.5C17.0523 15.5 17.5 15.0523 17.5 14.5C17.5 13.9477 17.0523 13.5 16.5 13.5C15.9477 13.5 15.5 13.9477 15.5 14.5C15.5 15.0523 15.9477 15.5 16.5 15.5Z" 
        fill={color}
      />
    </Svg>
  );
}
