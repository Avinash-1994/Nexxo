import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-195',
  templateUrl: './hero-195.component.html',
  styleUrls: ['./hero-195.component.css']
})
export class Hero195Component {
  @Input() heroId: number = 195;
  name: string = 'Hero 195';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}