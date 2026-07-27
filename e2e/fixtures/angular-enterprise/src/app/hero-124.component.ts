import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-124',
  templateUrl: './hero-124.component.html',
  styleUrls: ['./hero-124.component.css']
})
export class Hero124Component {
  @Input() heroId: number = 124;
  name: string = 'Hero 124';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}