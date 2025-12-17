# Installation

## Prerequisites

- Angular 17 or higher
- Node.js 18 or higher
- npm, yarn, or pnpm

## Install via npm

```bash
npm install ngxsmk-gatekeeper
```

## Install via yarn

```bash
yarn add ngxsmk-gatekeeper
```

## Install via pnpm

```bash
pnpm add ngxsmk-gatekeeper
```

## Peer Dependencies

The library requires the following peer dependencies (usually already installed in Angular projects):

- `@angular/common` ^17.0.0 || ^18.0.0 || ^19.0.0 || ^20.0.0
- `@angular/core` ^17.0.0 || ^18.0.0 || ^19.0.0 || ^20.0.0
- `@angular/router` ^17.0.0 || ^18.0.0 || ^19.0.0 || ^20.0.0
- `rxjs` ^7.2.0 || ^8.0.0

These are typically already installed in Angular projects. If not, install them:

```bash
npm install @angular/common @angular/core @angular/router rxjs
```

## Verify Installation

After installation, you should be able to import from the library:

```typescript
import { provideGatekeeper, gatekeeperGuard } from 'ngxsmk-gatekeeper';
```

If you see TypeScript errors, make sure:

1. The library is installed: `npm list ngxsmk-gatekeeper`
2. Your `tsconfig.json` includes the library types
3. Your IDE has reloaded the TypeScript server

## Next Steps

- [Quick Start](/guide/quick-start) - Get started with your first protected route
- [Configuration](/guide/configuration) - Learn about gatekeeper configuration options

