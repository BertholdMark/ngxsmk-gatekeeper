# ngxsmk-gatekeeper CLI

Standalone command-line tool for analyzing, testing, and managing ngxsmk-gatekeeper configurations.

## Installation

```bash
npm install -g @ngxsmk-gatekeeper/cli
```

Or use with npx:

```bash
npx @ngxsmk-gatekeeper/cli <command>
```

Command-line tool for managing and analyzing ngxsmk-gatekeeper configurations.

## Installation

```bash
npm install -g @ngxsmk-gatekeeper/cli
```

Or use with npx:

```bash
npx @ngxsmk-gatekeeper/cli <command>
```

## Commands

### init

Initialize a new ngxsmk-gatekeeper configuration file.

```bash
gatekeeper init
gatekeeper init --force  # Overwrite existing config
gatekeeper init --yes    # Use defaults without prompts
```

**Options:**
- `-f, --force` - Overwrite existing configuration
- `-y, --yes` - Skip interactive prompts and use defaults

**Creates:**
- `gatekeeper.config.json` - Configuration file
- `src/middlewares/auth.middleware.ts` - Example middleware (optional)

### analyze

Analyze route protection in your Angular application.

```bash
gatekeeper analyze
gatekeeper analyze --path src/app
gatekeeper analyze --format json
```

**Options:**
- `-p, --path <path>` - Path to routes file or directory (default: `src`)
- `-f, --format <format>` - Output format: `table` or `json` (default: `table`)

**Output:**
- Lists all routes with protection status
- Shows which routes have guards and middleware
- Provides summary statistics

### test

Test middleware chains with sample contexts.

```bash
gatekeeper test
gatekeeper test --config gatekeeper.config.json
gatekeeper test --test-file tests/middleware.test.json
```

**Options:**
- `-c, --config <path>` - Path to gatekeeper config file (default: `gatekeeper.config.json`)
- `-t, --test-file <path>` - Path to test file with test cases

**Test Cases:**
- Authenticated user
- Unauthenticated user
- User with admin role
- No user context

### export

Export middleware configuration and routes.

```bash
gatekeeper export
gatekeeper export --output backup.json
gatekeeper export --format json --include-routes
```

**Options:**
- `-o, --output <path>` - Output file path (default: `gatekeeper-export.json`)
- `-f, --format <format>` - Export format: `json` or `yaml` (default: `json`)
- `--include-routes` - Include route analysis in export

**Exports:**
- Configuration file
- Middleware files
- Route files (if `--include-routes` is specified)

## Examples

### Initialize Configuration

```bash
gatekeeper init
```

This will:
1. Create `gatekeeper.config.json`
2. Prompt for configuration options
3. Optionally create example middleware file

### Analyze Routes

```bash
gatekeeper analyze
```

Output:
```
Route Protection Analysis

Path                                    Guard      Middleware      File
----------------------------------------------------------------------------------------------------
/dashboard                              ✓         2 middleware(s) src/app/app.routes.ts
/profile                                ✓         1 middleware(s) src/app/app.routes.ts
/login                                  ✗         none            src/app/app.routes.ts

Summary:
  Total routes: 3
  Protected routes: 2
  Routes with middleware: 2
  Unprotected routes: 1
```

### Test Middleware

```bash
gatekeeper test
```

Output:
```
Test Results

Test Case                      Expected    Result       Status
--------------------------------------------------------------------------------
Authenticated user             true        true         ✓ PASS
Unauthenticated user           false       false        ✓ PASS
User with admin role           true        true         ✓ PASS
No user context                false       false        ✓ PASS

Summary:
  Passed: 4
  Failed: 0
  Total: 4

✓ All tests passed!
```

### Export Configuration

```bash
gatekeeper export --include-routes
```

Creates `gatekeeper-export.json` with:
- Configuration
- Middleware files
- Route files

## Configuration File

The `gatekeeper.config.json` file structure:

```json
{
  "middlewares": ["auth"],
  "onFail": "/login",
  "debug": false
}
```

## Development

To build the CLI locally:

```bash
cd tools/cli
npm install
npm run build
```

To test locally:

```bash
node dist/index.js <command>
```

## Troubleshooting

### Command not found

Make sure the CLI is installed globally or use npx:

```bash
npx @ngxsmk-gatekeeper/cli <command>
```

### TypeScript errors

The CLI requires TypeScript files to be analyzed. Make sure your project has TypeScript configured.

### Route analysis not finding routes

Specify the correct path:

```bash
gatekeeper analyze --path src/app
```

## Contributing

Contributions welcome! See the main project contributing guide.

