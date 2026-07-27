import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-176',
  templateUrl: './hero-176.component.html',
  styleUrls: ['./hero-176.component.css']
})
export class Hero176Component {
  @Input() heroId: number = 176;
  name: string = 'Hero 176';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}