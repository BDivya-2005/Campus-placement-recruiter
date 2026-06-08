import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// ✅ Bootstrap the standalone app
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),  // Routing setup
    provideHttpClient()     // Enables HttpClient for API calls
  ]
}).catch(err => console.error(err));
