import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-168',
  templateUrl: './hero-168.component.html',
  styleUrls: ['./hero-168.component.css']
})
export class Hero168Component {
  @Input() heroId: number = 168;
  name: string = 'Hero 168';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}