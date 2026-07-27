import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-140',
  templateUrl: './hero-140.component.html',
  styleUrls: ['./hero-140.component.css']
})
export class Hero140Component {
  @Input() heroId: number = 140;
  name: string = 'Hero 140';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}