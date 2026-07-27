import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-59',
  templateUrl: './hero-59.component.html',
  styleUrls: ['./hero-59.component.css']
})
export class Hero59Component {
  @Input() heroId: number = 59;
  name: string = 'Hero 59';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}