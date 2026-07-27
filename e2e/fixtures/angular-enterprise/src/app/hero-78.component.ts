import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-78',
  templateUrl: './hero-78.component.html',
  styleUrls: ['./hero-78.component.css']
})
export class Hero78Component {
  @Input() heroId: number = 78;
  name: string = 'Hero 78';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}