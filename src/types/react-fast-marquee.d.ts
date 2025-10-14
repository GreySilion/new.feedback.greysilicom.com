declare module 'react-fast-marquee' {
  import React from 'react';

  interface MarqueeProps {
    play?: boolean;
    pauseOnHover?: boolean;
    pauseOnClick?: boolean;
    direction?: 'left' | 'right' | 'up' | 'down';
    speed?: number;
    delay?: number;
    loop?: number;
    gradient?: boolean;
    gradientColor?: [number, number, number];
    gradientWidth?: number | string;
    gradientLength?: number | string;
    onCycleComplete?: () => void;
    onFinish?: () => void;
    className?: string;
    children?: React.ReactNode;
    style?: React.CSSProperties;
    autoFill?: boolean;
  }

  const Marquee: React.FC<MarqueeProps>;
  export default Marquee;
}
