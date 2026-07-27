import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-33',
  templateUrl: './hero-33.component.html',
  styleUrls: ['./hero-33.component.css']
})
export class Hero33Component {
  @Input() heroId: number = 33;
  name: string = 'Hero 33';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}