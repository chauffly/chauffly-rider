import React from "react";
import Svg, { Path } from "react-native-svg";

type SecurityProps = {
  color?: string;
};

const Security = ({ color = "#0E1B2B" }: SecurityProps) => {
  return (
    <Svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <Path
        d="M9 1.5L2.25 4.125V9C2.25 11.625 4.875 15.75 8.25 16.5C11.625 15.75 14.25 11.625 14.25 9V4.125L8.25 1.5H9Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Security;
