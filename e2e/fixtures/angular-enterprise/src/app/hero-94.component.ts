import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-94',
  templateUrl: './hero-94.component.html',
  styleUrls: ['./hero-94.component.css']
})
export class Hero94Component {
  @Input() heroId: number = 94;
  name: string = 'Hero 94';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}