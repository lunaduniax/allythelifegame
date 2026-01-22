import { Project, Task } from '@/types';

export const initialProjects: Project[] = [
  {
    id: '1',
    name: 'Marketing proyect',
    category: 'Work',
    color: '252 83% 90%', // #DAD2FB Lavender
    tasks: [
      {
        id: 't1',
        projectId: '1',
        title: 'Clarificar qué nos diferencia',
        category: 'Definir propuesta de valor',
        date: 'Jueves 6 de marzo',
        description: 'Analizar la competencia y definir qué nos hace únicos en el mercado. Revisar el posicionamiento actual y proponer mejoras.',
        status: 'in_progress',
      },
      {
        id: 't2',
        projectId: '1',
        title: 'Investigar estrategias de la competencia',
        category: 'Research',
        date: 'Jueves 6 de marzo',
        description: 'Hacer un análisis completo de las estrategias de marketing de nuestros principales competidores.',
        status: 'in_progress',
      },
      {
        id: 't3',
        projectId: '1',
        title: 'Buyer personas mapeando recorrido de compra',
        category: 'Definir público objetivo',
        date: 'Jueves 6 de marzo',
        description: 'Crear perfiles detallados de nuestros clientes ideales y mapear su journey de compra.',
        status: 'in_progress',
      },
      {
        id: 't4',
        projectId: '1',
        title: 'Generar ideas para publicaciones y campañas',
        category: 'Brainstorming de contenido',
        date: 'Jueves 6 de marzo',
        description: 'Sesión creativa para generar ideas de contenido para redes sociales y campañas publicitarias.',
        status: 'in_progress',
      },
    ],
  },
  {
    id: '2',
    name: 'Diseño Ally App',
    category: 'Proyectos personales',
    color: '68 100% 50%', // Yellow-green
    tasks: [
      {
        id: 't5',
        projectId: '2',
        title: 'Aplicar las mejoras en el design system',
        category: 'UI Design',
        date: 'Jueves 6 de marzo',
        description: 'Implementar los cambios acordados en el sistema de diseño para mantener consistencia visual.',
        status: 'in_progress',
      },
      {
        id: 't6',
        projectId: '2',
        title: 'Diseñar pantalla de onboarding',
        category: 'UX Design',
        date: 'Viernes 7 de marzo',
        description: 'Crear el flujo de onboarding para nuevos usuarios con ilustraciones y copy.',
        status: 'in_progress',
      },
    ],
  },
  {
    id: '3',
    name: 'Fitness Tracker',
    category: 'Personal',
    color: '180 70% 45%', // Teal
    tasks: [
      {
        id: 't7',
        projectId: '3',
        title: 'Definir métricas a trackear',
        category: 'Planning',
        date: 'Lunes 10 de marzo',
        description: 'Decidir qué métricas de fitness son las más importantes para el MVP.',
        status: 'in_progress',
      },
    ],
  },
];
