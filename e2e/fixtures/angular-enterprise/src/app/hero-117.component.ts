import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-117',
  templateUrl: './hero-117.component.html',
  styleUrls: ['./hero-117.component.css']
})
export class Hero117Component {
  @Input() heroId: number = 117;
  name: string = 'Hero 117';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}