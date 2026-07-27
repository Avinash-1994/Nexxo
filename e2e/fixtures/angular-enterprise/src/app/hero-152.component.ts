import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-152',
  templateUrl: './hero-152.component.html',
  styleUrls: ['./hero-152.component.css']
})
export class Hero152Component {
  @Input() heroId: number = 152;
  name: string = 'Hero 152';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}