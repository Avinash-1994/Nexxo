import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-54',
  templateUrl: './hero-54.component.html',
  styleUrls: ['./hero-54.component.css']
})
export class Hero54Component {
  @Input() heroId: number = 54;
  name: string = 'Hero 54';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}