import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-106',
  templateUrl: './hero-106.component.html',
  styleUrls: ['./hero-106.component.css']
})
export class Hero106Component {
  @Input() heroId: number = 106;
  name: string = 'Hero 106';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}