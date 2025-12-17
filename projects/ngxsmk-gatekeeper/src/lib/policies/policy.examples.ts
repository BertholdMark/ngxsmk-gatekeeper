/**
 * Example policy definitions
 * 
 * These are examples showing how to define and use policies.
 * They are not exported by default - copy and adapt for your use case.
 */

import { policy } from './policy';
import { MiddlewareContext } from '../core';

/**
 * Example: Billing access policy
 * 
 * Checks if user has premium subscription to access billing features
 */
export const canAccessBillingPolicy = policy(
  'canAccessBilling',
  (ctx: MiddlewareContext) => {
    const user = ctx.user as { subscription?: { tier?: string } } | undefined;
    return user?.subscription?.tier === 'premium';
  },
  'User must have premium subscription to access billing'
);

/**
 * Example: Admin policy
 * 
 * Checks if user has admin role
 */
export const isAdminPolicy = policy(
  'isAdmin',
  (ctx: MiddlewareContext) => {
    const user = ctx.user as { roles?: string[] } | undefined;
    return user?.roles?.includes('admin') ?? false;
  },
  'User must have admin role'
);

/**
 * Example: Async policy
 * 
 * Fetches user data and checks permissions asynchronously
 */
export const canEditPostPolicy = policy(
  'canEditPost',
  async (ctx: MiddlewareContext) => {
    // Example: async check
    const postId = ctx.params?.postId as string | undefined;
    const userId = (ctx.user as { id?: string } | undefined)?.id;
    
    if (!postId || !userId) {
      return false;
    }
    
    // In real implementation, you would fetch post and check ownership
    // const post = await postService.getPost(postId);
    // return post.authorId === userId || user.roles.includes('admin');
    
    return true; // Placeholder
  },
  'User must be post author or admin to edit'
);

/**
 * Example: Resource-based policy
 * 
 * Checks access to a specific resource based on context
 */
export const canAccessResourcePolicy = policy(
  'canAccessResource',
  (ctx: MiddlewareContext) => {
    const user = ctx.user as { 
      id?: string;
      permissions?: string[];
      organizationId?: string;
    } | undefined;
    
    const resource = ctx.resource as {
      ownerId?: string;
      organizationId?: string;
      requiredPermission?: string;
    } | undefined;
    
    if (!user || !resource) {
      return false;
    }
    
    // Owner has access
    if (resource.ownerId === user.id) {
      return true;
    }
    
    // Same organization with required permission
    if (
      resource.organizationId === user.organizationId &&
      resource.requiredPermission &&
      user.permissions?.includes(resource.requiredPermission)
    ) {
      return true;
    }
    
    return false;
  },
  'User must own resource or have required permission in same organization'
);

