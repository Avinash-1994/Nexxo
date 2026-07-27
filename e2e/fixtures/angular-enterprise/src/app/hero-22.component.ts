import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-22',
  templateUrl: './hero-22.component.html',
  styleUrls: ['./hero-22.component.css']
})
export class Hero22Component {
  @Input() heroId: number = 22;
  name: string = 'Hero 22';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}