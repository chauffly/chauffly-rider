import React from "react";
import Svg, { Path } from "react-native-svg";

const Door = () => {
  return (
    <Svg width="18" height="18" viewBox="0 0 18 18" fill="none" strokeWidth={1.5}>
      <Path
        d="M2.0625 15.9375H15.9375M3.9375 4.6875C3.9375 4.19022 4.13504 3.71331 4.48667 3.36167C4.83831 3.01004 5.31522 2.8125 5.8125 2.8125H12.1875C12.6848 2.8125 13.1617 3.01004 13.5133 3.36167C13.865 3.71331 14.0625 4.19022 14.0625 4.6875V15.9375H3.9375V4.6875Z"
        stroke="#0E1B2B"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M11.4375 10.5C12.0588 10.5 12.5625 9.99632 12.5625 9.375C12.5625 8.75368 12.0588 8.25 11.4375 8.25C10.8162 8.25 10.3125 8.75368 10.3125 9.375C10.3125 9.99632 10.8162 10.5 11.4375 10.5Z"
        fill="#0E1B2B"
      />
    </Svg>
  );
};

export default Door;
