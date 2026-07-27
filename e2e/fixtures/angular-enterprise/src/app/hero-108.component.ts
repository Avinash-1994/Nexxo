import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-108',
  templateUrl: './hero-108.component.html',
  styleUrls: ['./hero-108.component.css']
})
export class Hero108Component {
  @Input() heroId: number = 108;
  name: string = 'Hero 108';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}