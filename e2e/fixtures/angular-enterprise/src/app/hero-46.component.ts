import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-46',
  templateUrl: './hero-46.component.html',
  styleUrls: ['./hero-46.component.css']
})
export class Hero46Component {
  @Input() heroId: number = 46;
  name: string = 'Hero 46';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}