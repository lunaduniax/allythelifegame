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
    <header className="px-5 pt-12 pb-6">
      <div>
        <p className="text-muted-foreground text-base mb-1">
          Buen día {userName} :)
        </p>
        <h1 className="leading-tight tracking-tight font-light text-5xl">
          Tus {projectCount}
          <span className="mx-[10px] text-[#d4ff00]">✦</span>
          <br />
          proyectos
        </h1>
      </div>
    </header>
  );
};