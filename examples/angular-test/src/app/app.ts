import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [],
  template: `
    <div style="font-family: sans-serif; padding: 20px;">
      <h1 style="color: #dd0031;">🅰️ Urja Build Tool - Angular Test</h1>
      <p>Framework: <strong>Angular 17+ (Signals)</strong></p>
      <p>Status: ✅ Standard & Signal APIs Verified</p>
      <button (click)="increment()">Signal Count: {{ count() }}</button>
    </div>
  `,
  styles: [],
})
export class App {
  protected readonly count = signal(0);
  increment() { this.count.update(n => n + 1); }
}
