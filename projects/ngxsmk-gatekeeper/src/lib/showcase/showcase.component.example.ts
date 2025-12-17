/**
 * Showcase gallery component example
 * 
 * This is a reference implementation showing how to create
 * a showcase gallery component for displaying user implementations
 * and case studies.
 */

/**
 * Example Angular component structure
 */
export const ShowcaseGalleryComponentExample = `
import { Component, OnInit } from '@angular/core';
import { ShowcaseService } from 'ngxsmk-gatekeeper/lib/showcase';
import {
  ShowcaseEntry,
  ShowcaseCategory,
  ImplementationType,
  ShowcaseFilterOptions,
} from 'ngxsmk-gatekeeper/lib/showcase';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-showcase-gallery',
  template: \`
    <div class="showcase-gallery">
      <!-- Header -->
      <div class="gallery-header">
        <h1>Showcase Gallery</h1>
        <p>Real-world implementations and case studies using ngxsmk-gatekeeper</p>
      </div>

      <!-- Filters -->
      <div class="filters">
        <div class="filter-group">
          <label>Category</label>
          <select [(ngModel)]="filters.category" (change)="applyFilters()">
            <option [value]="null">All Categories</option>
            <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Type</label>
          <select [(ngModel)]="filters.type" (change)="applyFilters()">
            <option [value]="null">All Types</option>
            <option *ngFor="let type of types" [value]="type">{{ type }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Search</label>
          <input
            type="text"
            [(ngModel)]="filters.search"
            (input)="applyFilters()"
            placeholder="Search showcase..."
          />
        </div>

        <div class="filter-group">
          <label>
            <input
              type="checkbox"
              [(ngModel)]="filters.featured"
              (change)="applyFilters()"
            />
            Featured Only
          </label>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats" *ngIf="stats$ | async as stats">
        <div class="stat-item">
          <span class="stat-value">{{ stats.totalEntries }}</span>
          <span class="stat-label">Total Entries</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.featuredCount }}</span>
          <span class="stat-label">Featured</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.totalViews }}</span>
          <span class="stat-label">Total Views</span>
        </div>
      </div>

      <!-- Gallery Grid -->
      <div class="gallery-grid">
        <div
          *ngFor="let entry of entries$ | async"
          class="showcase-card"
          [class.featured]="entry.featured"
          (click)="viewEntry(entry)"
        >
          <div class="card-header">
            <span class="category-badge" [attr.data-category]="entry.category">
              {{ entry.category }}
            </span>
            <span class="type-badge">{{ entry.type }}</span>
            <span class="featured-badge" *ngIf="entry.featured">⭐ Featured</span>
          </div>

          <div class="card-body">
            <h3 class="card-title">{{ entry.title }}</h3>
            <p class="card-description">{{ entry.description }}</p>

            <div class="card-meta">
              <div class="company-info" *ngIf="entry.company">
                <span class="company-name">{{ entry.company.name }}</span>
                <span class="company-size" *ngIf="entry.company.size">
                  {{ entry.company.size }}
                </span>
              </div>

              <div class="card-stats">
                <span class="stat">
                  👁️ {{ entry.views || 0 }}
                </span>
                <span class="stat">
                  ❤️ {{ entry.likes || 0 }}
                </span>
              </div>
            </div>

            <div class="card-tags">
              <span *ngFor="let tag of entry.tags" class="tag">{{ tag }}</span>
            </div>
          </div>

          <div class="card-footer">
            <button class="btn-primary" (click)="viewEntry(entry); $event.stopPropagation()">
              View Details
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="searchResult$ | async as result">
        <button
          [disabled]="result.page === 1"
          (click)="previousPage()"
        >
          Previous
        </button>
        <span>Page {{ result.page }} of {{ result.totalPages }}</span>
        <button
          [disabled]="result.page === result.totalPages"
          (click)="nextPage()"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Entry Detail Modal -->
    <div class="modal" *ngIf="selectedEntry" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <button class="modal-close" (click)="closeModal()">×</button>

        <div class="entry-header">
          <h2>{{ selectedEntry.title }}</h2>
          <div class="entry-meta">
            <span class="author" *ngIf="selectedEntry.author">
              By {{ selectedEntry.author.name }}
            </span>
            <span class="date">{{ selectedEntry.publishedAt | date }}</span>
          </div>
        </div>

        <div class="entry-content" *ngIf="selectedEntry.content">
          <div [innerHTML]="selectedEntry.content | markdown"></div>
        </div>

        <div class="entry-code-examples" *ngIf="selectedEntry.codeExamples">
          <h3>Code Examples</h3>
          <div *ngFor="let example of selectedEntry.codeExamples" class="code-example">
            <h4>{{ example.description || 'Code Example' }}</h4>
            <pre><code [highlight]="example.code" [language]="example.language"></code></pre>
          </div>
        </div>

        <div class="entry-metrics" *ngIf="selectedEntry.metrics">
          <h3>Results</h3>
          <div class="metrics-grid">
            <div class="metric-item" *ngIf="selectedEntry.metrics.performanceImprovement">
              <span class="metric-label">Performance</span>
              <span class="metric-value">{{ selectedEntry.metrics.performanceImprovement }}</span>
            </div>
            <div class="metric-item" *ngIf="selectedEntry.metrics.securityImprovement">
              <span class="metric-label">Security</span>
              <span class="metric-value">{{ selectedEntry.metrics.securityImprovement }}</span>
            </div>
            <div class="metric-item" *ngIf="selectedEntry.metrics.timeSaved">
              <span class="metric-label">Time Saved</span>
              <span class="metric-value">{{ selectedEntry.metrics.timeSaved }}</span>
            </div>
          </div>
        </div>

        <div class="entry-links" *ngIf="selectedEntry.links">
          <h3>Related Links</h3>
          <ul>
            <li *ngFor="let link of selectedEntry.links">
              <a [href]="link.url" target="_blank">{{ link.label }}</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  \`,
  styles: [\`
    .showcase-gallery {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .gallery-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .filters {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .filter-group label {
      font-weight: 600;
      font-size: 14px;
    }

    .stats {
      display: flex;
      gap: 30px;
      margin-bottom: 30px;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #2196f3;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
    }

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .showcase-card {
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .showcase-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .showcase-card.featured {
      border-color: #ff9800;
      border-width: 2px;
    }

    .card-header {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      flex-wrap: wrap;
    }

    .category-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      background: #e3f2fd;
      color: #1976d2;
    }

    .type-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      background: #f5f5f5;
      color: #666;
    }

    .featured-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      background: #fff3e0;
      color: #f57c00;
    }

    .card-title {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 10px 0;
      color: #333;
    }

    .card-description {
      color: #666;
      margin-bottom: 15px;
      line-height: 1.5;
    }

    .card-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      font-size: 14px;
    }

    .company-name {
      font-weight: 600;
      color: #333;
    }

    .card-stats {
      display: flex;
      gap: 15px;
    }

    .card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 15px;
    }

    .tag {
      padding: 4px 10px;
      background: #f5f5f5;
      border-radius: 4px;
      font-size: 12px;
      color: #666;
    }

    .card-footer {
      display: flex;
      justify-content: flex-end;
    }

    .btn-primary {
      padding: 8px 16px;
      background: #2196f3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-primary:hover {
      background: #1976d2;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      margin-top: 30px;
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      padding: 30px;
      max-width: 900px;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
    }

    .modal-close {
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
    }

    .entry-header {
      margin-bottom: 20px;
    }

    .entry-meta {
      display: flex;
      gap: 15px;
      color: #666;
      font-size: 14px;
    }

    .code-example {
      margin-bottom: 20px;
    }

    .code-example pre {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .metric-item {
      padding: 15px;
      background: #f5f5f5;
      border-radius: 4px;
      text-align: center;
    }

    .metric-label {
      display: block;
      font-size: 14px;
      color: #666;
      margin-bottom: 5px;
    }

    .metric-value {
      display: block;
      font-size: 20px;
      font-weight: 600;
      color: #2196f3;
    }
  \`],
})
export class ShowcaseGalleryComponent implements OnInit {
  entries$: Observable<ShowcaseEntry[]>;
  searchResult$: Observable<any>;
  stats$: Observable<any>;
  selectedEntry: ShowcaseEntry | null = null;

  filters: ShowcaseFilterOptions = {
    category: undefined,
    type: undefined,
    search: '',
    featured: false,
    sortBy: 'date',
    sortOrder: 'desc',
    limit: 12,
    offset: 0,
  };

  categories = Object.values(ShowcaseCategory);
  types = Object.values(ImplementationType);

  constructor(private showcaseService: ShowcaseService) {}

  ngOnInit() {
    this.applyFilters();
    this.stats$ = this.showcaseService.getStats();
  }

  applyFilters() {
    this.searchResult$ = this.showcaseService.search(this.filters);
    this.searchResult$.subscribe((result) => {
      this.entries$ = of(result.entries);
    });
  }

  viewEntry(entry: ShowcaseEntry) {
    this.selectedEntry = entry;
    this.showcaseService.incrementViews(entry.id);
  }

  closeModal() {
    this.selectedEntry = null;
  }

  previousPage() {
    if (this.filters.offset) {
      this.filters.offset -= (this.filters.limit || 12);
      this.applyFilters();
    }
  }

  nextPage() {
    this.filters.offset = (this.filters.offset || 0) + (this.filters.limit || 12);
    this.applyFilters();
  }

  likeEntry(entry: ShowcaseEntry) {
    this.showcaseService.incrementLikes(entry.id);
  }
}
`;

