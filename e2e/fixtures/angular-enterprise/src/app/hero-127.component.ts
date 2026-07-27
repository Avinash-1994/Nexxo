import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-127',
  templateUrl: './hero-127.component.html',
  styleUrls: ['./hero-127.component.css']
})
export class Hero127Component {
  @Input() heroId: number = 127;
  name: string = 'Hero 127';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}