import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-107',
  templateUrl: './hero-107.component.html',
  styleUrls: ['./hero-107.component.css']
})
export class Hero107Component {
  @Input() heroId: number = 107;
  name: string = 'Hero 107';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}