import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-169',
  templateUrl: './hero-169.component.html',
  styleUrls: ['./hero-169.component.css']
})
export class Hero169Component {
  @Input() heroId: number = 169;
  name: string = 'Hero 169';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}