#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init';
import { analyzeCommand } from './commands/analyze';
import { testCommand } from './commands/test';
import { exportCommand } from './commands/export';
// Version will be set during build
const version = '1.0.0';

const program = new Command();

program
  .name('gatekeeper')
  .description('CLI tool for ngxsmk-gatekeeper - analyze, test, and manage your middleware configuration')
  .version(version);

// Register commands
program.addCommand(initCommand());
program.addCommand(analyzeCommand());
program.addCommand(testCommand());
program.addCommand(exportCommand());

// Parse arguments
program.parse();

