

## Agregar sección "Comunidad" al Bottom Nav

### Resumen
Agregar un nuevo ícono de Comunidad (videos, cursos) al bottom nav, con su ruta y página correspondiente.

### Cambios

1. **`src/components/BottomNav.tsx`**
   - Agregar `'community'` al tipo union de tabs
   - Agregar nuevo nav item con ícono `GraduationCap` (de lucide-react) entre Home y Create
   - Navegar a `/community` al hacer tap
   - Orden final: Home | Community | Create(+) | Notifications | Profile

2. **`src/components/AppShell.tsx`**
   - Agregar `'community'` al tipo union de activeTab
   - Agregar lógica de navegación para `/community` en `handleTabChange` y `getActiveTab`

3. **`src/pages/Community.tsx`** (nuevo)
   - Página placeholder con título "Comunidad", subtítulo descriptivo (videos, cursos)
   - Secciones vacías con íconos para "Videos" y "Cursos" como coming soon
   - Estilo consistente con las demás páginas de la app

4. **`src/App.tsx`**
   - Agregar `<Route path="/community" element={<Community />} />` dentro del AppShell layout

