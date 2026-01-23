import { FC } from 'react';

interface HeaderProps {
  userName: string;
  projectCount: number;
}

export const Header: FC<HeaderProps> = ({
  userName,
  projectCount,
}) => {
  return (
    <header className="px-6 pt-16 pb-8 animate-fade-in">
      <div className="space-y-2">
        <p className="text-muted-foreground text-lg font-light tracking-wide">
          Buen día {userName} :)
        </p>
        <h1 className="leading-[1.1] tracking-tight font-light text-[3.25rem]">
          Tus {projectCount}
          <span className="mx-3 text-primary inline-block animate-pulse-soft">✦</span>
          <br />
          <span className="font-normal">proyectos</span>
        </h1>
      </div>
    </header>
  );
};
