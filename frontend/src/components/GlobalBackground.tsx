import { memo } from 'react';

export const GlobalBackground = memo(() => (
  <div className="fixed inset-0 -z-10 w-full h-full overflow-hidden pointer-events-none select-none">
    <div 
      className="absolute inset-0 w-full h-full"
      style={{
        background: '#141414',
      }}
    />
    <div 
      className="absolute inset-0 w-full h-full"
      style={{
        backgroundImage: `url('/images/global-bg.svg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
      }}
    />
  </div>
));
