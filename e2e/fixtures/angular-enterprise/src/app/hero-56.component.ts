import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-56',
  templateUrl: './hero-56.component.html',
  styleUrls: ['./hero-56.component.css']
})
export class Hero56Component {
  @Input() heroId: number = 56;
  name: string = 'Hero 56';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}