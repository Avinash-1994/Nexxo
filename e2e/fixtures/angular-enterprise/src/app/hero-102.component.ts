import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-102',
  templateUrl: './hero-102.component.html',
  styleUrls: ['./hero-102.component.css']
})
export class Hero102Component {
  @Input() heroId: number = 102;
  name: string = 'Hero 102';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}