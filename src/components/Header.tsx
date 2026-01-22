import { FC } from 'react';

interface HeaderProps {
  userName: string;
  projectCount: number;
  avatarUrl?: string;
}

export const Header: FC<HeaderProps> = ({ userName, projectCount, avatarUrl }) => {
  return (
    <header className="px-5 pt-12 pb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-muted-foreground text-base mb-1">
            Buen día {userName} :)
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Tus {projectCount}
            <span className="text-accent">✦</span>
            <br />
            proyectos
          </h1>
        </div>
        <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary flex-shrink-0 mt-1">
          {avatarUrl ? (
            <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-semibold">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
