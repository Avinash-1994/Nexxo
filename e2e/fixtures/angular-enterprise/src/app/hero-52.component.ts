import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-52',
  templateUrl: './hero-52.component.html',
  styleUrls: ['./hero-52.component.css']
})
export class Hero52Component {
  @Input() heroId: number = 52;
  name: string = 'Hero 52';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}