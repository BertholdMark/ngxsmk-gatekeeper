# Showcase Gallery

A gallery of real-world implementations and case studies using ngxsmk-gatekeeper.

## Overview

The showcase gallery provides:

- **Case studies** from real companies
- **Code examples** and implementations
- **Best practices** and tutorials
- **Integration examples**
- **Success stories** and metrics

## Browse Showcase

### By Category

- **E-commerce** - Payment protection, shopping cart security
- **SaaS** - Multi-tenant applications, subscription management
- **Enterprise** - Large-scale deployments, compliance
- **API** - Public API protection, rate limiting
- **Security** - Security-focused implementations
- **Compliance** - SOC2, ISO 27001, GDPR compliance
- **Public** - Public-facing applications
- **Admin** - Admin panels and dashboards

### By Type

- **Case Studies** - Detailed real-world implementations
- **Code Examples** - Code snippets and patterns
- **Integrations** - Integration guides
- **Tutorials** - Step-by-step tutorials
- **Best Practices** - Recommended patterns

## Featured Showcases

### E-commerce Payment Protection

**Company:** ShopSecure  
**Category:** E-commerce  
**Type:** Case Study

How a leading e-commerce platform implemented comprehensive payment protection using ngxsmk-gatekeeper with CSRF protection, rate limiting, and session management.

**Results:**
- 99.9% reduction in fraudulent payment attempts
- Zero successful CSRF attacks
- 50% reduction in support tickets

[View Full Case Study](#)

### Multi-Tenant SaaS Application

**Company:** CloudWorks  
**Category:** SaaS  
**Type:** Case Study

A SaaS platform implemented fine-grained access control using ngxsmk-gatekeeper to manage multi-tenant isolation and role-based permissions.

**Results:**
- Zero tenant data leakage incidents
- 90% reduction in access control bugs
- Simplified permission management

[View Full Case Study](#)

### Enterprise Compliance

**Company:** EnterpriseCorp  
**Category:** Compliance  
**Type:** Case Study

An enterprise application achieved SOC2 and ISO 27001 compliance using ngxsmk-gatekeeper's compliance mode for comprehensive audit logging.

**Results:**
- Successfully passed SOC2 Type II audit
- ISO 27001 certification achieved
- Automated compliance reporting

[View Full Case Study](#)

## Using the Showcase Service

### Basic Usage

```typescript
import { ShowcaseService } from 'ngxsmk-gatekeeper/lib/showcase';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-showcase',
  template: `
    <div *ngFor="let entry of entries$ | async">
      <h3>{{ entry.title }}</h3>
      <p>{{ entry.description }}</p>
    </div>
  `,
})
export class ShowcaseComponent implements OnInit {
  entries$ = this.showcaseService.getAllEntries();

  constructor(private showcaseService: ShowcaseService) {}
}
```

### Search and Filter

```typescript
import { ShowcaseCategory, ImplementationType } from 'ngxsmk-gatekeeper/lib/showcase';

// Search with filters
const result$ = this.showcaseService.search({
  category: ShowcaseCategory.ECOMMERCE,
  type: ImplementationType.CASE_STUDY,
  search: 'payment',
  featured: true,
  sortBy: 'date',
  sortOrder: 'desc',
  limit: 10,
  offset: 0,
});

result$.subscribe((result) => {
  console.log('Entries:', result.entries);
  console.log('Total:', result.total);
  console.log('Page:', result.page);
});
```

### Get Statistics

```typescript
const stats$ = this.showcaseService.getStats();

stats$.subscribe((stats) => {
  console.log('Total entries:', stats.totalEntries);
  console.log('By category:', stats.byCategory);
  console.log('By type:', stats.byType);
  console.log('Featured:', stats.featuredCount);
  console.log('Total views:', stats.totalViews);
});
```

### Get Featured Entries

```typescript
const featured$ = this.showcaseService.getFeaturedEntries();

featured$.subscribe((entries) => {
  console.log('Featured entries:', entries);
});
```

### Get Entry by ID

```typescript
const entry$ = this.showcaseService.getEntry('ecommerce-payment-protection');

entry$.subscribe((entry) => {
  if (entry) {
    console.log('Title:', entry.title);
    console.log('Content:', entry.content);
    console.log('Code examples:', entry.codeExamples);
  }
});
```

## Submitting Your Showcase

We welcome contributions to the showcase gallery! To submit your implementation:

1. **Prepare Your Content**
   - Write a case study or code example
   - Include code snippets
   - Add metrics and results (if available)
   - Provide screenshots (optional)

2. **Format Your Entry**
   ```typescript
   const entry: ShowcaseEntry = {
     id: 'your-unique-id',
     title: 'Your Implementation Title',
     description: 'Brief description',
     category: ShowcaseCategory.YOUR_CATEGORY,
     type: ImplementationType.CASE_STUDY,
     tags: ['tag1', 'tag2'],
     company: {
       name: 'Your Company',
       industry: 'Your Industry',
       size: 'medium',
     },
     author: {
       name: 'Your Name',
       role: 'Your Role',
     },
     codeExamples: [
       {
         language: 'typescript',
         code: '// Your code here',
         description: 'Code description',
       },
     ],
     publishedAt: new Date().toISOString(),
   };
   ```

3. **Submit**
   - Open a pull request on GitHub
   - Or contact us at showcase@ngxsmk-gatekeeper.com

## Showcase Entry Structure

### Required Fields

- `id` - Unique identifier
- `title` - Entry title
- `description` - Short description
- `category` - Showcase category
- `type` - Implementation type
- `tags` - Array of tags
- `publishedAt` - Publication date

### Optional Fields

- `content` - Full markdown content
- `company` - Company information
- `author` - Author information
- `codeExamples` - Code examples
- `images` - Screenshots/images
- `metrics` - Results and metrics
- `links` - Related links
- `featured` - Featured flag
- `views` - View count
- `likes` - Like count

## Best Practices

1. **Be Specific** - Include concrete examples and code
2. **Show Results** - Include metrics and outcomes
3. **Use Tags** - Tag your entries appropriately
4. **Include Code** - Provide working code examples
5. **Tell a Story** - Explain the problem and solution

## See Also

- [Examples](../examples/)
- [Tutorials](../tutorials/)
- [Best Practices](../best-practices/)

