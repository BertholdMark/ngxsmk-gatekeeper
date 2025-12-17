import { NgxMiddleware } from './middleware.types';
import { DebugOptions } from './debug';

/**
 * Benchmark configuration options
 */
export interface BenchmarkConfig {
  /**
   * Enable benchmark mode
   * @default false
   */
  enabled?: boolean;
  /**
   * Warning threshold for individual middleware execution (in milliseconds)
   * Middleware exceeding this threshold will trigger a warning
   * @default 100
   */
  middlewareThreshold?: number;
  /**
   * Warning threshold for entire chain execution (in milliseconds)
   * Chains exceeding this threshold will trigger a warning
   * @default 500
   */
  chainThreshold?: number;
  /**
   * Number of executions to track for statistics
   * @default 50
   */
  sampleSize?: number;
}

/**
 * Benchmark statistics for a middleware
 */
export interface MiddlewareBenchmarkStats {
  name: string;
  index: number;
  executionCount: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  exceedsThreshold: boolean;
  threshold: number;
}

/**
 * Benchmark statistics for a chain
 */
export interface ChainBenchmarkStats {
  contextType: 'route' | 'http';
  contextPath?: string;
  executionCount: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  exceedsThreshold: boolean;
  threshold: number;
  middlewareStats: MiddlewareBenchmarkStats[];
}

/**
 * Gets middleware name for benchmarking
 */
function getMiddlewareName(
  middleware: NgxMiddleware,
  index: number
): string {
  if (middleware && typeof middleware === 'function') {
    const namedMiddleware = middleware as { middlewareName?: string };
    if (namedMiddleware.middlewareName) {
      return namedMiddleware.middlewareName;
    }
  }
  return `Middleware[${index}]`;
}

/**
 * Storage for benchmark statistics
 */
class BenchmarkStore {
  private middlewareStats = new Map<string, number[]>();
  private chainStats: Array<{
    contextType: 'route' | 'http';
    contextPath?: string;
    totalTime: number;
    middlewareTimes: Array<{ name: string; index: number; time: number }>;
  }> = [];
  private readonly sampleSize: number;

  constructor(sampleSize: number) {
    this.sampleSize = sampleSize;
  }

  recordMiddlewareExecution(
    middleware: NgxMiddleware,
    index: number,
    duration: number
  ): void {
    const name = getMiddlewareName(middleware, index);
    const key = `${name}[${index}]`;
    
    if (!this.middlewareStats.has(key)) {
      this.middlewareStats.set(key, []);
    }
    
    const times = this.middlewareStats.get(key)!;
    times.push(duration);
    
    // Keep only the last N samples
    if (times.length > this.sampleSize) {
      times.shift();
    }
  }

  recordChainExecution(
    contextType: 'route' | 'http',
    contextPath: string | undefined,
    totalTime: number,
    middlewareTimes: Array<{ name: string; index: number; time: number }>
  ): void {
    this.chainStats.push({
      contextType,
      ...(contextPath !== undefined && { contextPath }),
      totalTime,
      middlewareTimes,
    });
    
    // Keep only the last N samples
    if (this.chainStats.length > this.sampleSize) {
      this.chainStats.shift();
    }
  }

  getMiddlewareStats(threshold: number): MiddlewareBenchmarkStats[] {
    const stats: MiddlewareBenchmarkStats[] = [];
    
    for (const [key, times] of this.middlewareStats.entries()) {
      if (times.length === 0) continue;
      
      const [name, indexStr] = key.split('[');
      if (!indexStr) continue;
      const index = parseInt(indexStr.replace(']', ''), 10);
      const totalTime = times.reduce((sum, t) => sum + t, 0);
      const averageTime = totalTime / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      const exceedsThreshold = averageTime > threshold;
      
      stats.push({
        name: name || key,
        index,
        executionCount: times.length,
        totalTime,
        averageTime,
        minTime,
        maxTime,
        exceedsThreshold,
        threshold,
      });
    }
    
    return stats.sort((a, b) => b.averageTime - a.averageTime);
  }

  getChainStats(threshold: number): ChainBenchmarkStats | null {
    if (this.chainStats.length === 0) {
      return null;
    }
    
    const times = this.chainStats.map(c => c.totalTime);
    const totalTime = times.reduce((sum, t) => sum + t, 0);
    const averageTime = totalTime / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const exceedsThreshold = averageTime > threshold;
    
    // Aggregate middleware stats from all chain executions
    const middlewareMap = new Map<string, number[]>();
    for (const chain of this.chainStats) {
      for (const mt of chain.middlewareTimes) {
        const key = `${mt.name}[${mt.index}]`;
        if (!middlewareMap.has(key)) {
          middlewareMap.set(key, []);
        }
        middlewareMap.get(key)!.push(mt.time);
      }
    }
    
    const middlewareStats: MiddlewareBenchmarkStats[] = [];
    for (const [key, times] of middlewareMap.entries()) {
      const [name, indexStr] = key.split('[');
      if (!indexStr) continue;
      const index = parseInt(indexStr.replace(']', ''), 10);
      const total = times.reduce((sum, t) => sum + t, 0);
      const avg = total / times.length;
      
      middlewareStats.push({
        name: name || key,
        index,
        executionCount: times.length,
        totalTime: total,
        averageTime: avg,
        minTime: Math.min(...times),
        maxTime: Math.max(...times),
        exceedsThreshold: avg > threshold,
        threshold,
      });
    }
    
    // Use the most recent chain's context info
    const latestChain = this.chainStats[this.chainStats.length - 1];
    if (!latestChain) {
      throw new Error('No chain stats available');
    }
    
    return {
      contextType: latestChain.contextType,
      ...(latestChain.contextPath !== undefined && { contextPath: latestChain.contextPath }),
      executionCount: this.chainStats.length,
      totalTime,
      averageTime,
      minTime,
      maxTime,
      exceedsThreshold,
      threshold,
      middlewareStats: middlewareStats.sort((a, b) => b.averageTime - a.averageTime),
    };
  }

  clear(): void {
    this.middlewareStats.clear();
    this.chainStats = [];
  }
}

// Global benchmark store (only used when benchmark is enabled)
let benchmarkStore: BenchmarkStore | null = null;

/**
 * Initializes benchmark store
 */
function initializeBenchmark(config: BenchmarkConfig): void {
  if (!config.enabled) {
    return;
  }
  
  const sampleSize = config.sampleSize ?? 50;
  benchmarkStore = new BenchmarkStore(sampleSize);
}

/**
 * Records middleware execution for benchmarking
 */
export function recordMiddlewareBenchmark(
  config: BenchmarkConfig,
  middleware: NgxMiddleware,
  index: number,
  duration: number
): void {
  if (!config.enabled || !benchmarkStore) {
    return;
  }
  
  benchmarkStore.recordMiddlewareExecution(middleware, index, duration);
  
  // Check threshold and warn
  const threshold = config.middlewareThreshold ?? 100;
  if (duration > threshold) {
    const name = getMiddlewareName(middleware, index);
    console.warn(
      `%c⚠️ Middleware Performance Warning`,
      'color: #ff9800; font-weight: bold; font-size: 14px;'
    );
    console.warn(`Middleware "${name}" (index ${index}) took ${duration.toFixed(2)}ms, exceeding threshold of ${threshold}ms`);
    console.warn('Suggestions:');
    console.warn('  - Consider optimizing the middleware logic');
    console.warn('  - Check for unnecessary async operations');
    console.warn('  - Consider caching expensive computations');
    console.warn('  - Review if the middleware can be split into smaller pieces');
    if (duration > threshold * 2) {
      console.warn('  - ⚠️ This middleware is significantly slow - consider refactoring');
    }
  }
}

/**
 * Records chain execution for benchmarking
 */
export function recordChainBenchmark(
  config: BenchmarkConfig,
  options: DebugOptions,
  totalTime: number,
  middlewareTimes: Array<{ middleware: NgxMiddleware; index: number; time: number }>
): void {
  if (!config.enabled || !benchmarkStore) {
    return;
  }
  
  const middlewareTimesData = middlewareTimes.map(mt => ({
    name: getMiddlewareName(mt.middleware, mt.index),
    index: mt.index,
    time: mt.time,
  }));
  
  benchmarkStore.recordChainExecution(
    options.contextType,
    options.contextPath,
    totalTime,
    middlewareTimesData
  );
  
  // Check threshold and warn
  const threshold = config.chainThreshold ?? 500;
  if (totalTime > threshold) {
    console.warn(
      `%c⚠️ Chain Performance Warning`,
      'color: #ff9800; font-weight: bold; font-size: 14px;'
    );
    console.warn(`Middleware chain took ${totalTime.toFixed(2)}ms, exceeding threshold of ${threshold}ms`);
    console.warn(`Context: ${options.contextType} - ${options.contextPath || 'unknown'}`);
    console.warn('Suggestions:');
    console.warn('  - Review middleware order (place fast checks first)');
    console.warn('  - Consider reducing the number of middlewares');
    console.warn('  - Check for redundant middleware checks');
    console.warn('  - Consider using pipelines to optimize execution');
    
    // Show slowest middlewares
    const sorted = [...middlewareTimes].sort((a, b) => b.time - a.time);
    const slowest = sorted.slice(0, 3);
    if (slowest.length > 0) {
      console.warn('  - Slowest middlewares:');
      for (const mt of slowest) {
        const name = getMiddlewareName(mt.middleware, mt.index);
        console.warn(`    • ${name} (index ${mt.index}): ${mt.time.toFixed(2)}ms`);
      }
    }
    
    if (totalTime > threshold * 2) {
      console.warn('  - ⚠️ This chain is significantly slow - consider major optimization');
    }
  }
}

/**
 * Gets benchmark statistics
 */
export function getBenchmarkStats(
  config: BenchmarkConfig
): {
  middleware: MiddlewareBenchmarkStats[];
  chain: ChainBenchmarkStats | null;
} | null {
  if (!config.enabled || !benchmarkStore) {
    return null;
  }
  
  const middlewareThreshold = config.middlewareThreshold ?? 100;
  const chainThreshold = config.chainThreshold ?? 500;
  
  return {
    middleware: benchmarkStore.getMiddlewareStats(middlewareThreshold),
    chain: benchmarkStore.getChainStats(chainThreshold),
  };
}

/**
 * Clears benchmark statistics
 */
export function clearBenchmarkStats(config: BenchmarkConfig): void {
  if (!config.enabled || !benchmarkStore) {
    return;
  }
  
  benchmarkStore.clear();
}

/**
 * Initializes benchmark if enabled
 */
export function initializeBenchmarkIfEnabled(config: BenchmarkConfig): void {
  if (config.enabled) {
    initializeBenchmark(config);
  }
}

