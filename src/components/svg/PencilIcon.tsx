import Svg, { Path } from 'react-native-svg';

interface PencilIconProps {
  size?: number;
  color?: string;
}

export default function PencilIcon({ size = 24, color = '#0E1B2B' }: PencilIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 6L18 9M13 20H21M5 16L4 20L8 19L19.586 7.414C19.9609 7.03895 20.1716 6.53033 20.1716 6C20.1716 5.46967 19.9609 4.96106 19.586 4.586L19.414 4.414C19.0389 4.03906 18.5303 3.82843 18 3.82843C17.4697 3.82843 16.9611 4.03906 16.586 4.414L5 16Z" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
