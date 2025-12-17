import { Component, inject, OnInit } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Router, RouterLink, RouterOutlet, Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideGatekeeper, gatekeeperGuard } from 'ngxsmk-gatekeeper';
import { createAuthMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

// Components
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page">
      <h1>🏠 Home</h1>
      <p>This is a public page. Anyone can access it.</p>
      <a routerLink="/dashboard" class="btn">Go to Dashboard (requires auth)</a>
    </div>
  `,
})
class HomeComponent {}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  template: `
    <div class="page">
      <h1>🔐 Login</h1>
      <p>Please log in to access the dashboard.</p>
      <button (click)="login()" class="btn btn-primary">Login</button>
    </div>
  `,
})
class LoginComponent {
  private router = inject(Router);

  login() {
    localStorage.setItem('isAuthenticated', 'true');
    this.router.navigate(['/dashboard']);
  }
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  template: `
    <div class="page">
      <h1>📊 Dashboard</h1>
      <p>This is a protected page. You must be authenticated to see this.</p>
      <p class="success">✅ Authentication successful!</p>
    </div>
  `,
})
class DashboardComponent {}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="app">
      <nav class="navbar">
        <a routerLink="/" routerLinkActive="active">Home</a>
        <a routerLink="/login" routerLinkActive="active">Login</a>
        <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
        <button (click)="toggleAuth()" class="btn btn-small">
          {{ isAuthenticated ? 'Logout' : 'Login' }}
        </button>
      </nav>
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
class AppComponent implements OnInit {
  private router = inject(Router);
  isAuthenticated = false;

  toggleAuth() {
    this.isAuthenticated = !this.isAuthenticated;
    localStorage.setItem('isAuthenticated', String(this.isAuthenticated));
    if (this.isAuthenticated) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit() {
    this.isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  }
}

// Routes
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [gatekeeperGuard],
  },
];

// Bootstrap
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideGatekeeper({
      middlewares: [
        createAuthMiddleware({
          authPath: 'user.isAuthenticated',
        }),
      ],
      onFail: '/login',
      debug: true,
    }),
  ],
});

