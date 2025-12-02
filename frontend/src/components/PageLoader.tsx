import { memo } from 'react';

export const PageLoader = memo(() => (
  <div className="flex items-center justify-center min-h-[50vh] w-full">
    <div className="w-10 h-10 border-4 border-[#2A1205] border-t-[#FF6B00] rounded-full animate-spin" />
  </div>
));
