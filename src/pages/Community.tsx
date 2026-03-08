import { Video, BookOpen } from 'lucide-react';

const Community = () => {
  return (
    <div className="px-6 pt-14 pb-6">
      <h1 className="text-2xl font-bold text-foreground mb-1">Comunidad</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Videos, cursos y recursos para alcanzar tus metas
      </p>

      <div className="space-y-4">
        {[
          { icon: Video, title: 'Videos', desc: 'Contenido motivacional y educativo' },
          { icon: BookOpen, title: 'Cursos', desc: 'Aprende nuevas habilidades paso a paso' },
        ].map((section) => (
          <div
            key={section.title}
            className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <section.icon size={22} className="text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{section.title}</h2>
              <p className="text-xs text-muted-foreground">{section.desc}</p>
              <span className="inline-block mt-1.5 text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Próximamente
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
