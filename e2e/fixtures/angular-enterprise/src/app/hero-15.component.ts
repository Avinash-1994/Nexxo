import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-15',
  templateUrl: './hero-15.component.html',
  styleUrls: ['./hero-15.component.css']
})
export class Hero15Component {
  @Input() heroId: number = 15;
  name: string = 'Hero 15';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}