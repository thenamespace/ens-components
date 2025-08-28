# @arti/ui-components

A React component library scaffold using TypeScript, tsup, Storybook (Vite), and plain CSS with CSS variables for theming.

## Install

```bash
npm i @arti/ui-components
```

Peer dependencies:
- react, react-dom

## Usage

Wrap your app with `ThemeProvider` and use components.

```tsx
import React from 'react';
import { ThemeProvider, Button } from '@arti/ui-components';

export function App() {
  return (
    <ThemeProvider initialTheme="light">
      <Button>Click me</Button>
    </ThemeProvider>
  );
}
```

## Theming

- The library exposes CSS variables in `:root` and `[data-theme="dark"]`.
- Toggle theme via `useTheme` or set `data-theme` on a wrapper element.

```tsx
import { useTheme } from '@arti/ui-components';

function Toggle() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>Theme: {theme}</button>;
}
```

Override CSS variables in your app stylesheet if needed:

```css
:root {
  --ui-color-primary: #7c3aed;
}
```

## Development

- `npm run dev` - watch build
- `npm run build` - build to `dist`
- `npm run storybook` - run Storybook
- `npm run build-storybook` - build Storybook static site 