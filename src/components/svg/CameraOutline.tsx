import { Circle, Path, Rect, Svg } from 'react-native-svg';

interface CameraOutlineProps {
  size?: number;
  color?: string;
}

const CameraOutline = ({ size = 20, color = '#FFFFFF' }: CameraOutlineProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M6.5 4.5L5.5 6.5H3C2.17157 6.5 1.5 7.17157 1.5 8V15C1.5 15.8284 2.17157 16.5 3 16.5H17C17.8284 16.5 18.5 15.8284 18.5 15V8C18.5 7.17157 17.8284 6.5 17 6.5H14.5L13.5 4.5H6.5Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx="10"
        cy="11"
        r="3"
        stroke={color}
        strokeWidth="1.5"
      />
    </Svg>
  );
};

export default CameraOutline;
