# Publishing ngxsmk-gatekeeper to npm

This guide will walk you through publishing the ngxsmk-gatekeeper library to npm.

## Prerequisites

1. **npm account**: You need an npm account. Create one at [npmjs.com](https://www.npmjs.com/signup) if you don't have one.

2. **Login to npm**: 
   ```bash
   npm login
   ```
   Enter your username, password, and email when prompted.

3. **Verify you're logged in**:
   ```bash
   npm whoami
   ```

## Pre-Publishing Checklist

Before publishing, make sure:

- [ ] Version is updated in `projects/ngxsmk-gatekeeper/package.json`
- [ ] Author field is filled in `projects/ngxsmk-gatekeeper/package.json`
- [ ] Repository URL is correct (not placeholder)
- [ ] All tests pass: `npm test`
- [ ] Library builds successfully: `npm run build`
- [ ] README.md is up to date
- [ ] No sensitive information in the package

## Step-by-Step Publishing Process

### 1. Update Package Metadata (if needed)

Edit `projects/ngxsmk-gatekeeper/package.json` and ensure:
- `author` field is filled (e.g., `"Your Name <your.email@example.com>"`)
- `repository.url` points to your actual GitHub repository
- `bugs.url` points to your actual GitHub issues URL
- `homepage` points to your actual repository

### 2. Build the Library

Build the library for production:

```bash
npm run build
```

This will create the distributable files in `dist/ngxsmk-gatekeeper/`.

### 3. Verify the Build

Check that the build output looks correct:

```bash
ls -la dist/ngxsmk-gatekeeper/
```

You should see:
- `package.json` (copied from `projects/ngxsmk-gatekeeper/package.json`)
- `fesm2022/` directory with compiled JavaScript
- `lib/` directory with compiled modules
- `index.d.ts` and other TypeScript definition files
- `README.md` (if included)

### 4. Test the Package Locally (Optional but Recommended)

Before publishing, test the package locally:

```bash
cd dist/ngxsmk-gatekeeper
npm pack
```

This creates a `.tgz` file. You can install it in another project to test:

```bash
npm install /path/to/ngxsmk-gatekeeper-1.0.0.tgz
```

### 5. Check Package Name Availability

Verify the package name is available on npm:

```bash
npm view ngxsmk-gatekeeper
```

If it returns 404, the name is available. If it returns package info, the name is taken.

**Note**: If the name is taken, you'll need to:
- Choose a different name, or
- Use a scoped package name like `@your-username/ngxsmk-gatekeeper`

To use a scoped package, update the name in `projects/ngxsmk-gatekeeper/package.json`:
```json
{
  "name": "@your-username/ngxsmk-gatekeeper"
}
```

### 6. Publish to npm

Navigate to the dist directory and publish:

```bash
cd dist/ngxsmk-gatekeeper
npm publish
```

For scoped packages (if you used `@your-username/ngxsmk-gatekeeper`), make it public:

```bash
npm publish --access public
```

### 7. Verify Publication

Check that your package is published:

```bash
npm view ngxsmk-gatekeeper
```

Or visit: `https://www.npmjs.com/package/ngxsmk-gatekeeper`

## Publishing Scripts

You can use the provided npm scripts:

```bash
# Build and publish in one command
npm run build && cd dist/ngxsmk-gatekeeper && npm publish

# Or use the publish script (if added)
npm run publish:lib
```

## Updating Versions for Future Releases

When releasing a new version:

1. **Update version** in `projects/ngxsmk-gatekeeper/package.json`:
   - Patch: `1.0.0` → `1.0.1` (bug fixes)
   - Minor: `1.0.0` → `1.1.0` (new features)
   - Major: `1.0.0` → `2.0.0` (breaking changes)

2. **Update version** in root `package.json` (optional, for consistency)

3. **Update CHANGELOG.md** (if you have one)

4. **Build and publish**:
   ```bash
   npm run build
   cd dist/ngxsmk-gatekeeper
   npm publish
   ```

## Troubleshooting

### "You do not have permission to publish"

- Make sure you're logged in: `npm whoami`
- Check if the package name is already taken by someone else
- If it's a scoped package, use `--access public`

### "Package name already exists"

- The package name `ngxsmk-gatekeeper` is already taken
- Use a scoped package name: `@your-username/ngxsmk-gatekeeper`
- Or choose a different name

### "Invalid package name"

- Package names must be lowercase
- Can contain hyphens and underscores
- Cannot start with a dot or underscore
- Max 214 characters

### Build errors

- Make sure all dependencies are installed: `npm install`
- Check TypeScript compilation: `npm run build`
- Review error messages and fix issues

## Post-Publishing

After successful publication:

1. **Create a Git tag**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Create a GitHub release** (optional but recommended):
   - Go to your GitHub repository
   - Click "Releases" → "Create a new release"
   - Tag: `v1.0.0`
   - Title: `v1.0.0 - Initial Release`
   - Add release notes

3. **Update documentation** if needed

4. **Announce** on social media, forums, etc.

## Best Practices

1. **Always test locally** before publishing
2. **Follow semantic versioning** (semver)
3. **Write clear release notes**
4. **Tag releases in Git**
5. **Keep CHANGELOG.md updated**
6. **Test the published package** in a fresh project

## Resources

- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [npm Package Name Guidelines](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#name)

