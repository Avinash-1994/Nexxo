import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-21',
  templateUrl: './hero-21.component.html',
  styleUrls: ['./hero-21.component.css']
})
export class Hero21Component {
  @Input() heroId: number = 21;
  name: string = 'Hero 21';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}