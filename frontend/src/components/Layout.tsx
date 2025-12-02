import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-5lb-bg text-5lb-text">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
};
