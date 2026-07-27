import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-167',
  templateUrl: './hero-167.component.html',
  styleUrls: ['./hero-167.component.css']
})
export class Hero167Component {
  @Input() heroId: number = 167;
  name: string = 'Hero 167';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}