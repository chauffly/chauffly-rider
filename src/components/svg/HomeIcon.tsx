import Svg, { Path } from 'react-native-svg';

interface HomeIconProps {
  size?: number;
  color?: string;
  filled?: boolean;
}

export default function HomeIcon({ 
  size = 24, 
  color = '#000000',
  filled = false 
}: HomeIconProps) {
  if (filled) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path 
          d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" 
          fill={color}
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path 
        d="M12 5.69L17 10.19V18H15V12H9V18H7V10.19L12 5.69ZM12 3L2 12H5V20H11V14H13V20H19V12H22L12 3Z" 
        fill={color}
      />
    </Svg>
  );
}
