import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-149',
  templateUrl: './hero-149.component.html',
  styleUrls: ['./hero-149.component.css']
})
export class Hero149Component {
  @Input() heroId: number = 149;
  name: string = 'Hero 149';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}