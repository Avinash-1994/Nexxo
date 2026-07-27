import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-112',
  templateUrl: './hero-112.component.html',
  styleUrls: ['./hero-112.component.css']
})
export class Hero112Component {
  @Input() heroId: number = 112;
  name: string = 'Hero 112';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}