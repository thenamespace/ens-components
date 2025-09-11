# @arti/ui-components

A comprehensive React UI component library with TypeScript support, built for modern web applications.

## Features

- 🎨 **Modern Design System** - Consistent, accessible components
- 📱 **Responsive** - Mobile-first design approach
- 🌙 **Dark/Light Theme** - Built-in theme support
- 🎯 **TypeScript** - Full type safety and IntelliSense
- 📦 **Tree-shakable** - Import only what you need
- 🎭 **Storybook** - Interactive component documentation
- ⚡ **Performance** - Optimized for production use

## Installation

```bash
npm install @arti/ui-components
# or
yarn add @arti/ui-components
# or
pnpm add @arti/ui-components
```

## Quick Start

### 1. Import Styles

```tsx
// Import the bundled CSS
import '@arti/ui-components/styles';
```

### 2. Setup Theme Provider

```tsx
import { ThemeProvider } from '@arti/ui-components';

function App() {
  return (
    <ThemeProvider initialTheme="light">
      <YourApp />
    </ThemeProvider>
  );
}
```

### 3. Use Components

```tsx
import { Button, Text, Input, Tooltip } from '@arti/ui-components';

function MyComponent() {
  return (
    <div>
      <Text size="lg" weight="bold">Welcome!</Text>
      <Button variant="solid" prefix={<Icon name="check-circle" />}>
        Get Started
      </Button>
      <Input placeholder="Enter your name" />
      <Tooltip content="This is a tooltip">
        <Button>Hover me</Button>
      </Tooltip>
    </div>
  );
}
```

## Available Components

### Atoms
- **Button** - Interactive button with variants and icons
- **Input** - Form input with prefix/suffix support
- **Text** - Typography component with size and weight options
- **Icon** - Icon component with Lucide React icons
- **ChainIcon** - Blockchain network icons
- **Tooltip** - Contextual tooltip component

### Molecules
- **Alert** - Notification alert component
- **Dropdown** - Dropdown menu component
- **Modal** - Modal dialog component

### Complex Components
- **PendingTransaction** - Transaction status display
- **SelectRecordsForm** - ENS records form
- **EnsRecordsForm** - ENS management form

## Hooks

```tsx
import { useTheme, useWaitForTransaction, useWeb3Clients } from '@arti/ui-components';

function MyComponent() {
  const { theme, setTheme, toggleTheme } = useTheme();
  const { data, isLoading } = useWaitForTransaction({ hash: '0x...' });
  
  return (
    <div>
      <Button onClick={toggleTheme}>
        Switch to {theme === 'light' ? 'dark' : 'light'} mode
      </Button>
    </div>
  );
}
```

## Utils

```tsx
import { 
  formatAddress, 
  parseRecords, 
  validateAddress,
  getCoinInfo,
  getResolverAddress 
} from '@arti/ui-components';

// Format Ethereum address
const shortAddress = formatAddress('0x1234567890abcdef1234567890abcdef12345678');

// Parse ENS records
const records = parseRecords(recordData);

// Validate address
const isValid = validateAddress('0x123...');
```

## Types

```tsx
import type { 
  ButtonProps, 
  TransactionState, 
  TooltipPosition,
  ThemeName 
} from '@arti/ui-components';
```

## Web3 Integration

```tsx
import { 
  getResolverAddress,
  resolverAbi 
} from '@arti/ui-components';

// Get resolver contract address
const resolverAddress = getResolverAddress('mainnet');

// Use ABI for contract interactions
const contract = new ethers.Contract(resolverAddress, resolverAbi, provider);
```

## Theme Customization

The library uses CSS custom properties for theming. You can override the default theme:

```css
:root {
  --ns-color-primary: #your-color;
  --ns-color-bg: #your-bg-color;
  --ns-color-fg: #your-text-color;
  /* ... other theme variables */
}
```

## Storybook

To view all components and their documentation:

```bash
npm run storybook
```

## Development

```bash
# Install dependencies
npm install

# Start development build
npm run dev

# Build library
npm run build

# Run Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.