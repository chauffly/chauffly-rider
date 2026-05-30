import { Path, Svg } from 'react-native-svg';

interface PlusCircleProps {
  size?: number;
  color?: string;
  backgroundColor?: string;
}

const PlusCircle = ({ }: PlusCircleProps) => {
  return (
    <Svg width="30" height="30" viewBox="0 0 30 30" fill="none"  >
      <Path d="M15 28.125C22.2487 28.125 28.125 22.2487 28.125 15C28.125 7.75126 22.2487 1.875 15 1.875C7.75126 1.875 1.875 7.75126 1.875 15C1.875 22.2487 7.75126 28.125 15 28.125Z" stroke="#C29D59" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <Path d="M9.375 15H20.625" stroke="#C29D59" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <Path d="M15 9.375V20.625" stroke="#C29D59" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </Svg>

  );
};

export default PlusCircle;
