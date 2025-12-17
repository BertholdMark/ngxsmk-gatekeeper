import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import chalk from 'chalk';

interface RouteAnalysis {
  path: string;
  hasGuard: boolean;
  hasMiddleware: boolean;
  middlewareCount: number;
  file: string;
  line?: number;
}

export function analyzeCommand(): Command {
  const command = new Command('analyze')
    .description('Analyze route protection in your Angular application')
    .option('-p, --path <path>', 'Path to routes file or directory', 'src')
    .option('-f, --format <format>', 'Output format (table, json)', 'table')
    .action(async (options) => {
      try {
        console.log(chalk.cyan('Analyzing route protection...\n'));

        const routes = await findRoutes(options.path);
        const analysis = analyzeRoutes(routes);

        if (options.format === 'json') {
          console.log(JSON.stringify(analysis, null, 2));
        } else {
          printAnalysisTable(analysis);
        }

        // Summary
        const totalRoutes = analysis.length;
        const protectedRoutes = analysis.filter(r => r.hasGuard).length;
        const routesWithMiddleware = analysis.filter(r => r.hasMiddleware).length;

        console.log(chalk.cyan('\nSummary:'));
        console.log(`  Total routes: ${totalRoutes}`);
        console.log(`  Protected routes: ${chalk.green(protectedRoutes)}`);
        console.log(`  Routes with middleware: ${chalk.green(routesWithMiddleware)}`);
        console.log(`  Unprotected routes: ${chalk.yellow(totalRoutes - protectedRoutes)}`);

        if (totalRoutes - protectedRoutes > 0) {
          console.log(chalk.yellow('\n⚠ Warning: Some routes are not protected!'));
        }

      } catch (error) {
        console.error(chalk.red('Error analyzing routes:'), error);
        process.exit(1);
      }
    });

  return command;
}

async function findRoutes(searchPath: string): Promise<string[]> {
  const patterns = [
    '**/*.routes.ts',
    '**/app.routes.ts',
    '**/routes.ts',
    '**/routing.ts',
  ];

  const files: string[] = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, { cwd: searchPath, absolute: true });
    files.push(...matches);
  }

  return [...new Set(files)];
}

function analyzeRoutes(files: string[]): RouteAnalysis[] {
  const analysis: RouteAnalysis[] = [];

  for (const file of files) {
    if (!fs.existsSync(file)) continue;

    const content = fs.readFileSync(file, 'utf-8');
    const routes = extractRoutesFromContent(content, file);
    analysis.push(...routes);
  }

  return analysis;
}

function extractRoutesFromContent(content: string, filePath: string): RouteAnalysis[] {
  const routes: RouteAnalysis[] = [];

  // Simple regex-based parsing for route definitions
  // Matches: { path: '...', ... }
  const routePattern = /\{\s*path:\s*['"]([^'"]+)['"]/g;
  let match;

  while ((match = routePattern.exec(content)) !== null) {
    const pathValue = match[1];
    const routeStart = match.index;
    
    // Find the full route object
    const routeEnd = findMatchingBrace(content, routeStart);
    if (routeEnd === -1) continue;

    const routeContent = content.substring(routeStart, routeEnd + 1);
    const route = analyzeRouteObject(routeContent, filePath, pathValue);
    if (route) {
      routes.push(route);
    }
  }

  return routes;
}

function findMatchingBrace(content: string, start: number): number {
  let depth = 0;
  let inString = false;
  let stringChar = '';

  for (let i = start; i < content.length; i++) {
    const char = content[i];
    const prevChar = i > 0 ? content[i - 1] : '';

    // Handle string literals
    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
      continue;
    }

    if (inString) continue;

    if (char === '{') depth++;
    if (char === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function analyzeRouteObject(
  routeContent: string,
  filePath: string,
  pathValue: string
): RouteAnalysis | null {
  let hasGuard = false;
  let hasMiddleware = false;
  let middlewareCount = 0;

  // Check for canActivate
  if (routeContent.includes('canActivate')) {
    hasGuard = routeContent.includes('gatekeeperGuard');
  }

  // Check for gatekeeper middleware in data
  const gatekeeperDataMatch = routeContent.match(/gatekeeper:\s*\{[^}]*middlewares:\s*\[([^\]]*)\]/);
  if (gatekeeperDataMatch) {
    hasMiddleware = true;
    const middlewares = gatekeeperDataMatch[1];
    // Count middleware items (simple comma count + 1)
    middlewareCount = middlewares.split(',').filter(m => m.trim()).length || 1;
  }

  return {
    path: pathValue,
    hasGuard,
    hasMiddleware,
    middlewareCount,
    file: path.relative(process.cwd(), filePath),
  };
}

function printAnalysisTable(analysis: RouteAnalysis[]): void {
  console.log(chalk.bold('Route Protection Analysis\n'));
  console.log('Path'.padEnd(40) + 'Guard'.padEnd(10) + 'Middleware'.padEnd(15) + 'File');
  console.log('-'.repeat(100));

  for (const route of analysis) {
    const pathStr = route.path.padEnd(40);
    const guardStr = (route.hasGuard ? chalk.green('✓') : chalk.red('✗')).padEnd(10);
    const middlewareStr = route.hasMiddleware
      ? chalk.green(`${route.middlewareCount} middleware(s)`)
      : chalk.yellow('none');
    const fileStr = route.file;

    console.log(`${pathStr}${guardStr}${middlewareStr.padEnd(15)}${fileStr}`);
  }
}

