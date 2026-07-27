import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-89',
  templateUrl: './hero-89.component.html',
  styleUrls: ['./hero-89.component.css']
})
export class Hero89Component {
  @Input() heroId: number = 89;
  name: string = 'Hero 89';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}