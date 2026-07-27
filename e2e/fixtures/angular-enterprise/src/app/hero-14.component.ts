import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-14',
  templateUrl: './hero-14.component.html',
  styleUrls: ['./hero-14.component.css']
})
export class Hero14Component {
  @Input() heroId: number = 14;
  name: string = 'Hero 14';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}