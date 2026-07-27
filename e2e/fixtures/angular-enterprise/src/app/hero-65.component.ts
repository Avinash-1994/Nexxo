import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-65',
  templateUrl: './hero-65.component.html',
  styleUrls: ['./hero-65.component.css']
})
export class Hero65Component {
  @Input() heroId: number = 65;
  name: string = 'Hero 65';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}