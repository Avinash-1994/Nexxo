import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-80',
  templateUrl: './hero-80.component.html',
  styleUrls: ['./hero-80.component.css']
})
export class Hero80Component {
  @Input() heroId: number = 80;
  name: string = 'Hero 80';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}