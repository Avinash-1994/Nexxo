import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-60',
  templateUrl: './hero-60.component.html',
  styleUrls: ['./hero-60.component.css']
})
export class Hero60Component {
  @Input() heroId: number = 60;
  name: string = 'Hero 60';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}