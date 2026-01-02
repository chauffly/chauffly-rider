import { Path, Svg } from 'react-native-svg';

interface UserOutlineProps {
  size?: number;
  color?: string;
}

const UserOutline = ({ size = 18, color = '#C29D59' }: UserOutlineProps) => {
  return (
    <Svg width="18" height="18" viewBox="0 0 18 18" fill="none"  >
      <Path d="M14.7956 15.3353C14.4543 14.3783 13.7006 13.533 12.6528 12.93C11.6051 12.327 10.3211 12 9.00033 12C7.67958 12 6.39558 12.327 5.34783 12.93C4.30008 13.533 3.54633 14.3783 3.20508 15.3353" stroke="#C29D59" stroke-linecap="round" />
      <Path d="M9 9C10.6569 9 12 7.65685 12 6C12 4.34315 10.6569 3 9 3C7.34315 3 6 4.34315 6 6C6 7.65685 7.34315 9 9 9Z" stroke="#C29D59" stroke-linecap="round" />
    </Svg>

  );
};

export default UserOutline;
