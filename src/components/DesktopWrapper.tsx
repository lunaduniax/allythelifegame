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
    <div className="min-h-screen w-full bg-background">
      {/* Desktop split layout */}
      <div className="min-h-screen w-full lg:flex">
        {/* Left column - Auth form area (pure black) */}
        <div className="w-full lg:w-1/2 lg:min-h-screen lg:bg-black lg:flex lg:items-center lg:justify-center lg:p-8">
          <div className={`
            w-full min-h-screen bg-background
            lg:min-h-0 lg:max-w-[460px] lg:rounded-[2rem] lg:shadow-2xl lg:border lg:border-white/10
            ${isAuthPage ? 'lg:max-h-[720px] lg:overflow-auto' : 'lg:max-h-[85vh] lg:overflow-hidden'}
          `}>
            {children}
          </div>
        </div>

        {/* Right column - Banner/testimonial panel with photo background (desktop only) */}
        <div 
          className="hidden lg:flex lg:w-1/2 lg:min-h-screen relative"
          style={{
            backgroundImage: `url(${authSidePhoto})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/65" />
          
          {/* Content on top of overlay */}
          <div className="relative z-10 flex flex-col justify-between p-12 w-full">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">A</span>
              </div>
              <span className="text-white font-semibold text-xl">Ally</span>
            </div>

            {/* Testimonial section */}
            <div className="flex-1 flex flex-col justify-center max-w-lg">
              <blockquote className="text-white text-3xl font-medium leading-relaxed mb-8">
                "Ally me ayudó a organizar mis metas y mantenerme enfocado en lo que realmente importa."
              </blockquote>
              <div>
                <p className="text-primary font-semibold text-lg">María González</p>
                <p className="text-white/70 text-sm">Emprendedora Digital</p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-white/50 text-sm">
              © 2026 Ally. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopWrapper;
