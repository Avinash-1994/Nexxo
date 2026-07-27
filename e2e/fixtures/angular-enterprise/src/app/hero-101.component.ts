import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-101',
  templateUrl: './hero-101.component.html',
  styleUrls: ['./hero-101.component.css']
})
export class Hero101Component {
  @Input() heroId: number = 101;
  name: string = 'Hero 101';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}