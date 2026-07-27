import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-157',
  templateUrl: './hero-157.component.html',
  styleUrls: ['./hero-157.component.css']
})
export class Hero157Component {
  @Input() heroId: number = 157;
  name: string = 'Hero 157';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}