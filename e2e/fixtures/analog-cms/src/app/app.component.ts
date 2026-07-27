import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <main>
      <h1>Analog CMS</h1>
      <router-outlet></router-outlet>
    </main>
  `,
})
export class AppComponent {}
