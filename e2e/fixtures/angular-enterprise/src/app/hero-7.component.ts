import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-7',
  templateUrl: './hero-7.component.html',
  styleUrls: ['./hero-7.component.css']
})
export class Hero7Component {
  @Input() heroId: number = 7;
  name: string = 'Hero 7';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}