import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-93',
  templateUrl: './hero-93.component.html',
  styleUrls: ['./hero-93.component.css']
})
export class Hero93Component {
  @Input() heroId: number = 93;
  name: string = 'Hero 93';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}