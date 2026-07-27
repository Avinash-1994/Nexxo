import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-95',
  templateUrl: './hero-95.component.html',
  styleUrls: ['./hero-95.component.css']
})
export class Hero95Component {
  @Input() heroId: number = 95;
  name: string = 'Hero 95';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}