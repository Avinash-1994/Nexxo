import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-161',
  templateUrl: './hero-161.component.html',
  styleUrls: ['./hero-161.component.css']
})
export class Hero161Component {
  @Input() heroId: number = 161;
  name: string = 'Hero 161';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}