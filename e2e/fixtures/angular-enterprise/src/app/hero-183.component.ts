import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-183',
  templateUrl: './hero-183.component.html',
  styleUrls: ['./hero-183.component.css']
})
export class Hero183Component {
  @Input() heroId: number = 183;
  name: string = 'Hero 183';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}