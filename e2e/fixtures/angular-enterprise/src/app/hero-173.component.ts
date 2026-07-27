import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-173',
  templateUrl: './hero-173.component.html',
  styleUrls: ['./hero-173.component.css']
})
export class Hero173Component {
  @Input() heroId: number = 173;
  name: string = 'Hero 173';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}