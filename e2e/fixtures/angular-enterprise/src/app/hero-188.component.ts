import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-188',
  templateUrl: './hero-188.component.html',
  styleUrls: ['./hero-188.component.css']
})
export class Hero188Component {
  @Input() heroId: number = 188;
  name: string = 'Hero 188';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}