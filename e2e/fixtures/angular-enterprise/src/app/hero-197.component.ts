import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-197',
  templateUrl: './hero-197.component.html',
  styleUrls: ['./hero-197.component.css']
})
export class Hero197Component {
  @Input() heroId: number = 197;
  name: string = 'Hero 197';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}