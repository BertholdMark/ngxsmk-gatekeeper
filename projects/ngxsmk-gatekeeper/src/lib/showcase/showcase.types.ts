/**
 * Showcase gallery types for user implementations and case studies
 */

/**
 * Showcase category
 */
export enum ShowcaseCategory {
  /** E-commerce implementations */
  ECOMMERCE = 'ecommerce',
  /** SaaS applications */
  SAAS = 'saas',
  /** Enterprise applications */
  ENTERPRISE = 'enterprise',
  /** API protection */
  API = 'api',
  /** Security-focused implementations */
  SECURITY = 'security',
  /** Compliance implementations */
  COMPLIANCE = 'compliance',
  /** Public applications */
  PUBLIC = 'public',
  /** Admin panels */
  ADMIN = 'admin',
  /** Other implementations */
  OTHER = 'other',
}

/**
 * Implementation type
 */
export enum ImplementationType {
  /** Full case study */
  CASE_STUDY = 'case_study',
  /** Code example */
  CODE_EXAMPLE = 'code_example',
  /** Integration example */
  INTEGRATION = 'integration',
  /** Tutorial */
  TUTORIAL = 'tutorial',
  /** Best practice */
  BEST_PRACTICE = 'best_practice',
}

/**
 * Company/organization information
 */
export interface CompanyInfo {
  /** Company name */
  name: string;
  /** Company website */
  website?: string;
  /** Company logo URL */
  logo?: string;
  /** Industry */
  industry?: string;
  /** Company size */
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
}

/**
 * Author information
 */
export interface AuthorInfo {
  /** Author name */
  name: string;
  /** Author email */
  email?: string;
  /** Author GitHub username */
  github?: string;
  /** Author avatar URL */
  avatar?: string;
  /** Author role */
  role?: string;
  /** Author company */
  company?: string;
}

/**
 * Code example
 */
export interface CodeExample {
  /** Code language */
  language: 'typescript' | 'javascript' | 'json' | 'html' | 'css';
  /** Code content */
  code: string;
  /** Code description */
  description?: string;
  /** File name */
  filename?: string;
}

/**
 * Screenshot or image
 */
export interface ShowcaseImage {
  /** Image URL */
  url: string;
  /** Image alt text */
  alt: string;
  /** Image caption */
  caption?: string;
  /** Thumbnail URL */
  thumbnail?: string;
}

/**
 * Metrics and results
 */
export interface ShowcaseMetrics {
  /** Performance improvement */
  performanceImprovement?: string;
  /** Security improvement */
  securityImprovement?: string;
  /** Time saved */
  timeSaved?: string;
  /** Cost reduction */
  costReduction?: string;
  /** Other metrics */
  custom?: Record<string, string>;
}

/**
 * Showcase entry
 */
export interface ShowcaseEntry {
  /** Unique ID */
  id: string;
  /** Entry title */
  title: string;
  /** Short description */
  description: string;
  /** Full content */
  content?: string;
  /** Category */
  category: ShowcaseCategory;
  /** Implementation type */
  type: ImplementationType;
  /** Company information */
  company?: CompanyInfo;
  /** Author information */
  author?: AuthorInfo;
  /** Tags */
  tags: string[];
  /** Code examples */
  codeExamples?: CodeExample[];
  /** Screenshots/images */
  images?: ShowcaseImage[];
  /** Metrics and results */
  metrics?: ShowcaseMetrics;
  /** Related links */
  links?: Array<{
    label: string;
    url: string;
    type?: 'github' | 'website' | 'blog' | 'documentation' | 'other';
  }>;
  /** Featured flag */
  featured?: boolean;
  /** Publication date */
  publishedAt: string;
  /** Last updated date */
  updatedAt?: string;
  /** View count */
  views?: number;
  /** Like count */
  likes?: number;
}

/**
 * Showcase filter options
 */
export interface ShowcaseFilterOptions {
  /** Filter by category */
  category?: ShowcaseCategory;
  /** Filter by type */
  type?: ImplementationType;
  /** Filter by tags */
  tags?: string[];
  /** Filter by company size */
  companySize?: CompanyInfo['size'];
  /** Search query */
  search?: string;
  /** Show only featured */
  featured?: boolean;
  /** Sort order */
  sortBy?: 'date' | 'views' | 'likes' | 'title';
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
  /** Limit results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Showcase search result
 */
export interface ShowcaseSearchResult {
  /** Matching entries */
  entries: ShowcaseEntry[];
  /** Total count */
  total: number;
  /** Current page */
  page: number;
  /** Total pages */
  totalPages: number;
}

/**
 * Showcase statistics
 */
export interface ShowcaseStats {
  /** Total entries */
  totalEntries: number;
  /** Entries by category */
  byCategory: Record<ShowcaseCategory, number>;
  /** Entries by type */
  byType: Record<ImplementationType, number>;
  /** Featured entries count */
  featuredCount: number;
  /** Total views */
  totalViews: number;
  /** Total likes */
  totalLikes: number;
}

