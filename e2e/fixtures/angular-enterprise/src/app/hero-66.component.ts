import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-66',
  templateUrl: './hero-66.component.html',
  styleUrls: ['./hero-66.component.css']
})
export class Hero66Component {
  @Input() heroId: number = 66;
  name: string = 'Hero 66';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}