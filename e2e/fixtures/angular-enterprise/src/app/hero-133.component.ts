import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-133',
  templateUrl: './hero-133.component.html',
  styleUrls: ['./hero-133.component.css']
})
export class Hero133Component {
  @Input() heroId: number = 133;
  name: string = 'Hero 133';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}