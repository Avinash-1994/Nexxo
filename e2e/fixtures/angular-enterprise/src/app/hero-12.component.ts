import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-12',
  templateUrl: './hero-12.component.html',
  styleUrls: ['./hero-12.component.css']
})
export class Hero12Component {
  @Input() heroId: number = 12;
  name: string = 'Hero 12';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}