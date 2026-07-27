import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-110',
  templateUrl: './hero-110.component.html',
  styleUrls: ['./hero-110.component.css']
})
export class Hero110Component {
  @Input() heroId: number = 110;
  name: string = 'Hero 110';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}