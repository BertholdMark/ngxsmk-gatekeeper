# Documentation

This directory contains the VitePress documentation for ngxsmk-gatekeeper.

## Development

Start the development server:

```bash
npm run docs:dev
```

The documentation will be available at `http://localhost:5173`

## Build

Build the documentation for production:

```bash
npm run docs:build
```

The built files will be in `docs/.vitepress/dist`

## Preview

Preview the production build:

```bash
npm run docs:preview
```

## Structure

```
docs/
├── .vitepress/
│   └── config.ts          # VitePress configuration
├── guide/                  # Guide pages
│   ├── getting-started.md
│   ├── installation.md
│   ├── quick-start.md
│   └── middleware-pattern.md
├── examples/               # Example pages
│   ├── index.md
│   └── minimal-auth.md
└── index.md                # Home page
```

## Adding New Pages

1. Create a new `.md` file in the appropriate directory
2. Add it to the sidebar in `.vitepress/config.ts`
3. The page will be automatically available

## Markdown Features

VitePress supports:
- Code highlighting
- Custom containers (tip, warning, danger, etc.)
- Vue components
- Search functionality
- And more!

See [VitePress documentation](https://vitepress.dev/) for details.

