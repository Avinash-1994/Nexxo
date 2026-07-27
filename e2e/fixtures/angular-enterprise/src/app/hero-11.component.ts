import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-11',
  templateUrl: './hero-11.component.html',
  styleUrls: ['./hero-11.component.css']
})
export class Hero11Component {
  @Input() heroId: number = 11;
  name: string = 'Hero 11';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}