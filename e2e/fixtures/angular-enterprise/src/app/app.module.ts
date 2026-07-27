import { NgModule, Component } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

const NG_VERSION = '17.3.0';

@Component({
  selector: 'app-root',
  template: `
    <header class="app-toolbar">
      <span class="brand">Acme Enterprise Console</span>
      <nav>
        <a href="/">Dashboard</a>
        <a href="/reports">Reports</a>
        <a href="/settings">Settings</a>
      </nav>
      <span class="user-chip">signed in as admin@acme.com</span>
    </header>
    <main class="dashboard">
      <h1>Enterprise Dashboard</h1>
      <p class="subtitle">Server-rendered Angular application served through the Lunx dev server.</p>
      <section class="metrics">
        <div class="metric-card"><h2>Monthly Revenue</h2><p class="value">$1,284,900</p></div>
        <div class="metric-card"><h2>Active Seats</h2><p class="value">4,812</p></div>
        <div class="metric-card"><h2>Open Tickets</h2><p class="value">37</p></div>
        <div class="metric-card"><h2>Uptime (30d)</h2><p class="value">99.98%</p></div>
      </section>
      <section class="recent">
        <h2>Recent Activity</h2>
        <ul>
          <li>Invoice INV-4821 was paid by Globex Corporation.</li>
          <li>New team "Platform Engineering" provisioned with 24 seats.</li>
          <li>Security policy updated: SSO enforced for all members.</li>
        </ul>
      </section>
    </main>
    <footer class="app-footer">Angular {{ ngVersion }} · Lunx SSR</footer>
  `
})
export class AppComponent {
  ngVersion = NG_VERSION;
}

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
