# Shareable Playground URLs

This file contains shareable URLs for all playground examples. These URLs can be embedded in documentation, blog posts, or shared directly.

## Minimal Authentication Example

### StackBlitz
```
https://stackblitz.com/github/NGXSMK/ngxsmk-gatekeeper/tree/main/tools/playground/stackblitz/examples/minimal-auth
```

**Embed Code:**
```markdown
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/NGXSMK/ngxsmk-gatekeeper/tree/main/tools/playground/stackblitz/examples/minimal-auth)
```

### CodeSandbox
```
https://codesandbox.io/s/ngxsmk-gatekeeper-minimal-auth
```

**Embed Code:**
```markdown
[![Open in CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/ngxsmk-gatekeeper-minimal-auth)
```

## Direct Embed HTML

### StackBlitz
```html
<iframe
  src="https://stackblitz.com/github/NGXSMK/ngxsmk-gatekeeper/tree/main/tools/playground/stackblitz/examples/minimal-auth?embed=1&file=src/main.ts"
  width="100%"
  height="600px"
  frameborder="0"
></iframe>
```

### CodeSandbox
```html
<iframe
  src="https://codesandbox.io/embed/ngxsmk-gatekeeper-minimal-auth?fontsize=14&hidenavigation=1&theme=dark"
  style="width:100%; height:600px; border:0; border-radius: 4px; overflow:hidden;"
  title="ngxsmk-gatekeeper-minimal-auth"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>
```

## Generating New URLs

To generate new playground URLs, use the playground generator:

```typescript
import { generatePlaygroundURLs } from './playground-generator';

const urls = generatePlaygroundURLs('minimal-auth');
console.log('StackBlitz:', urls.stackblitz);
console.log('CodeSandbox:', urls.codesandbox);
```

## Updating URLs

When adding new examples:

1. Create the example in `tools/playground/stackblitz/examples/` or `tools/playground/codesandbox/examples/`
2. Update `playground-generator.ts` with the new example
3. Add the URLs to this file
4. Update documentation with the new playground links

