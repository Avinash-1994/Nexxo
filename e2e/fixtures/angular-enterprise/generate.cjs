const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'src', 'app');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Generate 200 components
for (let i = 1; i <= 200; i++) {
  const tsContent = `
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-${i}',
  templateUrl: './hero-${i}.component.html',
  styleUrls: ['./hero-${i}.component.css']
})
export class Hero${i}Component {
  @Input() heroId: number = ${i};
  name: string = 'Hero ${i}';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}
`;

  const cssContent = `
.hero-card-${i} {
  background-color: #f4f4f4;
  border-radius: 8px;
  padding: 16px;
  color: #333;
  display: flex;
}
.hero-card-${i}:hover {
  transform: scale(1.05);
}
`;

  const htmlContent = `
<div class="hero-card-${i}">
  <h2>{{ name }}</h2>
  <p>Power Level: {{ powerLevel() }}</p>
</div>
`;

  fs.writeFileSync(path.join(outDir, `hero-${i}.component.ts`), tsContent.trim());
  fs.writeFileSync(path.join(outDir, `hero-${i}.component.css`), cssContent.trim());
  fs.writeFileSync(path.join(outDir, `hero-${i}.component.html`), htmlContent.trim());
}

// Write the main.ts
fs.writeFileSync(path.join(__dirname, 'src', 'main.ts'), `
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
`);
