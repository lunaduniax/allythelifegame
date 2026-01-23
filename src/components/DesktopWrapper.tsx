import { ReactNode } from 'react';

interface DesktopWrapperProps {
  children: ReactNode;
}

const DesktopWrapper = ({ children }: DesktopWrapperProps) => {
  return (
    <div className="min-h-screen w-full bg-background lg:bg-desktop-gradient lg:bg-fixed">
      {/* Noise overlay for desktop */}
      <div className="hidden lg:block fixed inset-0 bg-noise opacity-[0.03] pointer-events-none" />
      
      {/* Centered phone container */}
      <div className="min-h-screen w-full lg:flex lg:items-center lg:justify-center lg:py-8">
        <div className="w-full lg:max-w-[430px] lg:min-h-[85vh] lg:max-h-[900px] lg:rounded-[2.5rem] lg:shadow-phone lg:border lg:border-white/10 lg:overflow-hidden lg:relative bg-background">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DesktopWrapper;
