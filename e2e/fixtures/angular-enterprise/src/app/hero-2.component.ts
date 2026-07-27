import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-2',
  templateUrl: './hero-2.component.html',
  styleUrls: ['./hero-2.component.css']
})
export class Hero2Component {
  @Input() heroId: number = 2;
  name: string = 'Hero 2';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}