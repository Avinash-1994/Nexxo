import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-103',
  templateUrl: './hero-103.component.html',
  styleUrls: ['./hero-103.component.css']
})
export class Hero103Component {
  @Input() heroId: number = 103;
  name: string = 'Hero 103';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}