import { Path, Svg } from 'react-native-svg';

interface ChevronLeftProps {
  size?: number;
  color?: string;
}

const ChevronLeft = ({ size = 24, color = '#212121' }: ChevronLeftProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18L9 12L15 6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default ChevronLeft;
