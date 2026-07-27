import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-192',
  templateUrl: './hero-192.component.html',
  styleUrls: ['./hero-192.component.css']
})
export class Hero192Component {
  @Input() heroId: number = 192;
  name: string = 'Hero 192';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}