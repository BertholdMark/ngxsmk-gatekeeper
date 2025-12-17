/**
 * Integration hook for observability
 * 
 * This module provides integration between the middleware runner
 * and the observability service.
 */

import { ObservabilityService } from './observability.service';
import { MiddlewareContext, NgxMiddleware } from '../core';
import { getMiddlewareName } from '../core/debug';

/**
 * Observability integration options
 */
export interface ObservabilityIntegrationOptions {
  /** Observability service instance */
  service: ObservabilityService;
  /** Context type */
  contextType: 'route' | 'http';
  /** Context path */
  contextPath?: string;
}

/**
 * Create observability hooks for middleware execution
 */
export function createObservabilityHooks(options: ObservabilityIntegrationOptions) {
  const { service, contextType, contextPath } = options;

  return {
    /**
     * Hook called before middleware chain execution
     */
    onChainStart: (context: MiddlewareContext, middlewareCount: number) => {
      service.recordChainStart(context, contextType, contextPath, middlewareCount);
    },

    /**
     * Hook called after middleware chain execution
     */
    onChainEnd: (
      context: MiddlewareContext,
      result: boolean,
      stoppedAt: number,
      totalDuration: number,
      redirect?: string,
      middlewareExecutions?: Array<{
        middleware: NgxMiddleware;
        index: number;
        startTime: number;
        endTime: number;
        result: boolean;
        error?: unknown;
      }>
    ) => {
      const executions = middlewareExecutions?.map((exec) => ({
        name: getMiddlewareName(exec.middleware, exec.index),
        index: exec.index,
        duration: exec.endTime - exec.startTime,
        result: exec.result,
        error: exec.error ? String(exec.error) : undefined,
      }));

      service.recordChainEnd(
        context,
        contextType,
        contextPath,
        result,
        stoppedAt,
        totalDuration,
        redirect,
        executions?.map(exec => {
          const { error, ...rest } = exec;
          return {
            ...rest,
            ...(error !== undefined ? { error } : {}),
          };
        })
      );
    },

    /**
     * Hook called before middleware execution
     */
    onMiddlewareStart: (
      middleware: NgxMiddleware,
      index: number,
      context: MiddlewareContext
    ) => {
      const name = getMiddlewareName(middleware, index);
      service.recordMiddlewareStart(name, index, context, contextType, contextPath);
    },

    /**
     * Hook called after middleware execution
     */
    onMiddlewareEnd: (
      middleware: NgxMiddleware,
      index: number,
      context: MiddlewareContext,
      result: boolean,
      duration: number,
      error?: unknown
    ) => {
      const name = getMiddlewareName(middleware, index);
      service.recordMiddlewareEnd(
        name,
        index,
        context,
        contextType,
        contextPath,
        result,
        duration,
        error ? String(error) : undefined
      );
    },

    /**
     * Hook called on error
     */
    onError: (error: Error, source: 'middleware' | 'chain' | 'system', context?: Record<string, unknown>) => {
      service.recordError(error.message, error.stack, source, context);
    },
  };
}

