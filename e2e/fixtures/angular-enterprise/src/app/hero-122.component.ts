import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-122',
  templateUrl: './hero-122.component.html',
  styleUrls: ['./hero-122.component.css']
})
export class Hero122Component {
  @Input() heroId: number = 122;
  name: string = 'Hero 122';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}