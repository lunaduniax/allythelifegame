import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import authSidePhoto from '@/assets/auth-side-photo.png';

interface DesktopWrapperProps {
  children: ReactNode;
}

const DesktopWrapper = ({ children }: DesktopWrapperProps) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  return (
    <div className="min-h-screen w-full bg-background lg:bg-[#f5f5f7]">
      {/* Desktop split layout */}
      <div className="min-h-screen w-full lg:flex">
        {/* Left branding panel - desktop only */}
        <div className="hidden lg:flex lg:w-[40%] lg:min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f1a] relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-noise opacity-[0.03]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
          
          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between p-12 w-full">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">A</span>
              </div>
              <span className="text-white font-semibold text-xl">Ally</span>
            </div>

            {/* Testimonial section */}
            <div className="flex-1 flex flex-col justify-center max-w-md">
              <blockquote className="text-white/90 text-2xl font-medium leading-relaxed mb-6">
                "Ally me ayudó a organizar mis metas y mantenerme enfocado en lo que realmente importa."
              </blockquote>
              <div>
                <p className="text-primary font-semibold">María González</p>
                <p className="text-white/60 text-sm">Emprendedora Digital</p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-white/40 text-sm">
              © 2026 Ally. Todos los derechos reservados.
            </div>
          </div>
        </div>

        {/* Right content panel - pure black on desktop */}
        <div className="w-full lg:w-[60%] lg:min-h-screen lg:bg-black lg:flex lg:items-center lg:justify-center lg:gap-8 lg:px-8 lg:py-12">
          {/* Form card */}
          <div className={`
            w-full min-h-screen bg-background
            lg:min-h-0 lg:max-w-[430px] lg:flex-shrink-0 lg:rounded-[2rem] lg:shadow-2xl lg:border lg:border-white/10
            ${isAuthPage ? 'lg:max-h-[700px] lg:overflow-auto' : 'lg:max-h-[85vh] lg:overflow-hidden'}
          `}>
            {children}
          </div>

          {/* Side photo - desktop only, auth page only */}
          {isAuthPage && (
            <div className="hidden lg:block lg:w-[380px] lg:flex-shrink-0 lg:h-[600px]">
              <img
                src={authSidePhoto}
                alt="Person working on their goals"
                className="w-full h-full object-cover rounded-[2rem] shadow-2xl"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesktopWrapper;
