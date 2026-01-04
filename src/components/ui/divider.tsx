import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/context/theme-context';
import { spacing } from '@/constants/spacing';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  color?: string;
  marginVertical?: number;
  marginHorizontal?: number;
  style?: ViewStyle;
}

export function Divider({
  orientation = 'horizontal',
  thickness = 1,
  color,
  marginVertical,
  marginHorizontal,
  style,
}: DividerProps) {
  const { colors } = useTheme();

  const dividerColor = color || colors.border;

  const dividerStyle: ViewStyle = orientation === 'horizontal'
    ? {
      height: thickness,
      // width: '100%',
      backgroundColor: dividerColor,
      marginVertical: marginVertical ?? 0,
      marginHorizontal: marginHorizontal ?? 0,
    }
    : {
      width: thickness,
      // height: '100%',
      backgroundColor: dividerColor,
      marginVertical: marginVertical ?? 0,
      marginHorizontal: marginHorizontal ?? 0,
    };

  return <View style={[dividerStyle, style]} />;
}

const styles = StyleSheet.create({});
