import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-88',
  templateUrl: './hero-88.component.html',
  styleUrls: ['./hero-88.component.css']
})
export class Hero88Component {
  @Input() heroId: number = 88;
  name: string = 'Hero 88';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}