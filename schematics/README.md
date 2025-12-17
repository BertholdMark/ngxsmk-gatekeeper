# ngxsmk-gatekeeper Schematics

This directory contains Angular schematics for ngxsmk-gatekeeper that help you quickly set up and generate middleware code.

## Available Schematics

### ng-add

Installs ngxsmk-gatekeeper and sets up basic configuration.

```bash
ng add ngxsmk-gatekeeper
```

**Options:**
- `--skip-install` - Skip npm package installation
- `--setup-guard` - Set up route guard configuration (default: true)
- `--setup-interceptor` - Set up HTTP interceptor configuration (default: true)
- `--create-example` - Create example middleware and route files (default: true)

### middleware

Generates a new middleware function.

```bash
ng generate ngxsmk-gatekeeper:middleware <name>
# or
ng g ngxsmk-gatekeeper:middleware <name>
# or using alias
ng g ngxsmk-gatekeeper:mw <name>
```

**Options:**
- `--type` - Type of middleware: `auth`, `role`, or `custom` (default: `custom`)
- `--path` - Path where the middleware file will be created (default: `src/app/middlewares`)
- `--project` - Project name (default: first project in workspace)

**Examples:**
```bash
# Generate custom middleware
ng g ngxsmk-gatekeeper:middleware my-custom-auth

# Generate authentication middleware
ng g ngxsmk-gatekeeper:middleware user-auth --type=auth

# Generate role-based middleware
ng g ngxsmk-gatekeeper:middleware admin-only --type=role
```

### pipeline

Generates a new middleware pipeline.

```bash
ng generate ngxsmk-gatekeeper:pipeline <name>
# or
ng g ngxsmk-gatekeeper:pipeline <name>
# or using alias
ng g ngxsmk-gatekeeper:pipe <name>
```

**Options:**
- `--middlewares` - Comma-separated list of middleware names to include (default: `auth`)
- `--path` - Path where the pipeline file will be created (default: `src/app/pipelines`)
- `--project` - Project name (default: first project in workspace)

**Examples:**
```bash
# Generate pipeline with default auth middleware
ng g ngxsmk-gatekeeper:pipeline admin-pipeline

# Generate pipeline with multiple middlewares
ng g ngxsmk-gatekeeper:pipeline secure-pipeline --middlewares=auth,role,csrf
```

## Development

To test schematics locally:

1. Build the schematics:
```bash
npm run build
```

2. Link the package (if testing in another project):
```bash
npm link
```

3. Test the schematic:
```bash
ng generate ngxsmk-gatekeeper:middleware test-middleware --dry-run
```

## File Structure

```
schematics/
├── collection.json          # Schematic collection definition
├── tsconfig.json           # TypeScript configuration
├── ng-add/                 # ng-add schematic
│   ├── schema.json        # Schema definition
│   ├── schema.d.ts        # TypeScript types
│   ├── index.ts           # Main schematic logic
│   └── files/             # Template files
├── middleware/            # Middleware generator
│   ├── schema.json
│   ├── schema.d.ts
│   ├── index.ts
│   ├── custom-middleware/  # Custom middleware template
│   ├── auth-middleware/    # Auth middleware template
│   └── role-middleware/    # Role middleware template
└── pipeline/              # Pipeline generator
    ├── schema.json
    ├── schema.d.ts
    ├── index.ts
    └── pipeline/           # Pipeline template
```

