import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-191',
  templateUrl: './hero-191.component.html',
  styleUrls: ['./hero-191.component.css']
})
export class Hero191Component {
  @Input() heroId: number = 191;
  name: string = 'Hero 191';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}