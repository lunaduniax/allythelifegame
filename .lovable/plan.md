

## Mejorar el Splash Screen

Currently there is no splash screen component in the codebase. Based on the project memory, there was one previously but it's been removed. I'll create an improved, polished splash screen.

### What will be built

A full-screen animated splash that shows for ~2.5s on initial app load, then transitions out smoothly. It will feature:

- **Dark background** matching the app's `--background` color with a subtle radial green (`primary`) glow
- **Animated logo**: The "A" icon scales in with a spring animation, followed by the "Ally" text fading in
- **Sparkle accent**: A small ✨ emoji animates in after the logo
- **Tagline**: "Play the life game, one step at a time." fades up below
- **Exit transition**: The entire screen fades out and scales slightly before unmounting
- After 2.5s, it auto-dismisses; authenticated users go to Home, unauthenticated to Auth (existing routing handles this)

### Files

1. **`src/components/SplashScreen.tsx`** (new)
   - Uses `framer-motion` (already installed) for staggered entrance animations and smooth exit
   - Internal state with a timer to trigger dismissal after 2.5s
   - Calls `onFinish` callback when exit animation completes

2. **`src/App.tsx`** (edit)
   - Add `showSplash` state (defaults `true`)
   - Render `<SplashScreen>` with `AnimatePresence` above the router
   - On finish, set `showSplash = false` — existing routes render underneath

### Animation sequence (framer-motion)
- 0.0s: Background fades in
- 0.2s: Logo icon scales from 0.5 → 1 with spring
- 0.5s: "Ally" text slides up + fades in
- 0.8s: Tagline fades in
- 2.5s: Entire container fades out + scales to 1.05, then unmounts

No changes to UI, layout, navigation, or existing flows.

