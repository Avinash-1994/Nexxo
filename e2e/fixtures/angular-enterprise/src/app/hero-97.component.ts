import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-97',
  templateUrl: './hero-97.component.html',
  styleUrls: ['./hero-97.component.css']
})
export class Hero97Component {
  @Input() heroId: number = 97;
  name: string = 'Hero 97';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}