import { Circle, Path, Svg } from 'react-native-svg';

interface GenderOutlineProps {
  size?: number;
  color?: string;
}

const GenderOutline = ({ size = 18, color = '#C29D59' }: GenderOutlineProps) => {
  return (

    <Svg width="18" height="18" viewBox="0 0 18 18" fill="none" >
      <Path d="M10.5 3.75V4.5H12.975L9.75 7.725C9 7.125 8.1 6.75 7.125 6.75C4.875 6.75 3 8.625 3 10.875C3 13.125 4.875 15 7.125 15C9.375 15 11.25 13.125 11.25 10.875C11.25 9.9 10.875 9 10.275 8.25L13.5 5.025V7.5H14.25V3.75H10.5ZM7.125 7.5C7.875 7.5 8.625 7.8 9.225 8.25C9.375 8.4 9.6 8.55 9.75 8.775C10.2 9.375 10.5 10.125 10.5 10.875C10.5 12.75 9 14.25 7.125 14.25C5.25 14.25 3.75 12.75 3.75 10.875C3.75 9 5.25 7.5 7.125 7.5Z" fill="#C29D59" />
    </Svg>

  );
};

export default GenderOutline;
