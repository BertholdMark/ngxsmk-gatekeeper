# Interactive Playground

Try ngxsmk-gatekeeper directly in your browser without installing anything.

## Live Playgrounds

- **[StackBlitz Playground](../playground/)** - Run examples in StackBlitz
- **[CodeSandbox Playground](../playground/)** - Run examples in CodeSandbox

## Available Examples

- Minimal Auth Demo
- Role-Based Routing
- HTTP Protection
- Security Features
- And more...

[View all examples →](../../docs/examples/)

Interactive playground examples for ngxsmk-gatekeeper that can be run in StackBlitz and CodeSandbox.

## Available Examples

### Minimal Authentication
- **StackBlitz**: [Open in StackBlitz](./stackblitz/examples/minimal-auth)
- **CodeSandbox**: [Open in CodeSandbox](./codesandbox/examples/minimal-auth)
- **Description**: Basic authentication protection with route guards

### Role-Based Access Control
- **Description**: Role-based middleware with multiple user roles

### HTTP Request Protection
- **Description**: Protect HTTP requests using interceptors

## Using the Playground

### StackBlitz

1. Navigate to the example directory
2. Copy the files to a new StackBlitz project
3. Or use the StackBlitz import feature with the GitHub URL

**Quick Start:**
```bash
# Open in StackBlitz
https://stackblitz.com/github/NGXSMK/ngxsmk-gatekeeper/tree/main/tools/playground/stackblitz/examples/minimal-auth
```

### CodeSandbox

1. Navigate to the example directory
2. Create a new CodeSandbox project
3. Import the files or use the CodeSandbox import feature

**Quick Start:**
```bash
# Create sandbox from template
# Use CodeSandbox import feature with the example directory
```

## Creating New Examples

1. Create a new directory under `stackblitz/examples/` or `codesandbox/examples/`
2. Include the following files:
   - `main.ts` - Main application file
   - `index.html` - HTML template
   - `styles.css` - Styles
   - `package.json` - Dependencies
   - `angular.json` (StackBlitz only) - Angular configuration
   - `tsconfig.json` (StackBlitz only) - TypeScript configuration

3. Update the playground generator with the new example

## Shareable URLs

Use the playground generator to create shareable URLs:

```typescript
import { generatePlaygroundURLs } from './playground-generator';

const urls = generatePlaygroundURLs('minimal-auth');
console.log(urls.stackblitz); // StackBlitz URL
console.log(urls.codesandbox); // CodeSandbox URL
```

## Embedding in Documentation

You can embed playground examples in documentation using iframes or direct links:

```markdown
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/...)

[![Open in CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/...)
```

## Structure

```
tools/playground/
├── README.md                    # This file
├── playground-generator.ts      # URL generator utility
├── stackblitz/                  # StackBlitz templates
│   ├── template.json           # StackBlitz template config
│   └── examples/               # Example projects
│       └── minimal-auth/       # Minimal auth example
│           ├── main.ts
│           ├── index.html
│           ├── styles.css
│           ├── package.json
│           ├── angular.json
│           └── tsconfig.json
└── codesandbox/                 # CodeSandbox templates
    ├── template.json           # CodeSandbox template config
    └── examples/               # Example projects
        └── minimal-auth/       # Minimal auth example
            ├── src/
            │   ├── main.ts
            │   ├── index.html
            │   └── styles.css
            └── package.json
```

