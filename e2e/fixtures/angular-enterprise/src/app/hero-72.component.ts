import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-72',
  templateUrl: './hero-72.component.html',
  styleUrls: ['./hero-72.component.css']
})
export class Hero72Component {
  @Input() heroId: number = 72;
  name: string = 'Hero 72';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}