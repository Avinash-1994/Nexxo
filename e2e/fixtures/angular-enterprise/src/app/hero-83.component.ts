import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-83',
  templateUrl: './hero-83.component.html',
  styleUrls: ['./hero-83.component.css']
})
export class Hero83Component {
  @Input() heroId: number = 83;
  name: string = 'Hero 83';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}