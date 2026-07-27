import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-96',
  templateUrl: './hero-96.component.html',
  styleUrls: ['./hero-96.component.css']
})
export class Hero96Component {
  @Input() heroId: number = 96;
  name: string = 'Hero 96';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}