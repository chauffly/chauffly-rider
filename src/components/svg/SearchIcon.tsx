import { Circle, Path, Svg } from 'react-native-svg';

interface SearchIconProps {
  size?: number;
  color?: string;
}

const SearchIcon = ({ size = 24, color = '#212121' }: SearchIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="11"
        cy="11"
        r="7"
        stroke={color}
        strokeWidth="2"
      />
      <Path
        d="M21 21L16.5 16.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default SearchIcon;
