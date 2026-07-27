import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-70',
  templateUrl: './hero-70.component.html',
  styleUrls: ['./hero-70.component.css']
})
export class Hero70Component {
  @Input() heroId: number = 70;
  name: string = 'Hero 70';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}