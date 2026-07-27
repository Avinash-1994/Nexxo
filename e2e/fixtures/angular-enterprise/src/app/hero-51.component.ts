import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-51',
  templateUrl: './hero-51.component.html',
  styleUrls: ['./hero-51.component.css']
})
export class Hero51Component {
  @Input() heroId: number = 51;
  name: string = 'Hero 51';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}