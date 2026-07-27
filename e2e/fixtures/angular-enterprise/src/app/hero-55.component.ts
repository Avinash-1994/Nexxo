import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-55',
  templateUrl: './hero-55.component.html',
  styleUrls: ['./hero-55.component.css']
})
export class Hero55Component {
  @Input() heroId: number = 55;
  name: string = 'Hero 55';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}