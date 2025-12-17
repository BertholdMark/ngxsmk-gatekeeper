import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { glob } from 'glob';

export function exportCommand(): Command {
  const command = new Command('export')
    .description('Export middleware configuration and routes')
    .option('-o, --output <path>', 'Output file path', 'gatekeeper-export.json')
    .option('-f, --format <format>', 'Export format (json, yaml)', 'json')
    .option('--include-routes', 'Include route analysis in export', false)
    .action(async (options) => {
      try {
        console.log(chalk.cyan('Exporting configuration...\n'));

        const exportData: any = {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        };

        // Export config
        const configPath = path.resolve('gatekeeper.config.json');
        if (fs.existsSync(configPath)) {
          exportData.config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
          console.log(chalk.green(`✓ Loaded config from ${configPath}`));
        }

        // Export routes if requested
        if (options.includeRoutes) {
          const routes = await findRoutes('src');
          exportData.routes = routes.map(file => ({
            file: path.relative(process.cwd(), file),
            content: fs.readFileSync(file, 'utf-8'),
          }));
          console.log(chalk.green(`✓ Found ${routes.length} route file(s)`));
        }

        // Export middleware files
        const middlewareFiles = await findMiddlewareFiles('src');
        exportData.middlewares = middlewareFiles.map(file => ({
          file: path.relative(process.cwd(), file),
          content: fs.readFileSync(file, 'utf-8'),
        }));
        console.log(chalk.green(`✓ Found ${middlewareFiles.length} middleware file(s)`));

        // Write export file
        const outputPath = path.resolve(options.output);
        if (options.format === 'yaml') {
          // Would need yaml library for YAML export
          console.log(chalk.yellow('YAML format not yet supported, exporting as JSON'));
        }

        fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
        console.log(chalk.green(`\n✓ Export completed: ${outputPath}`));
        console.log(chalk.cyan(`  File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`));

      } catch (error) {
        console.error(chalk.red('Error exporting configuration:'), error);
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
  ];

  const files: string[] = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, { cwd: searchPath, absolute: true });
    files.push(...matches);
  }

  return [...new Set(files)];
}

async function findMiddlewareFiles(searchPath: string): Promise<string[]> {
  const patterns = [
    '**/*.middleware.ts',
    '**/middlewares/**/*.ts',
  ];

  const files: string[] = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, { cwd: searchPath, absolute: true });
    files.push(...matches);
  }

  return [...new Set(files)];
}

