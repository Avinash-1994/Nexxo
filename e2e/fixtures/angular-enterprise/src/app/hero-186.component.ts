import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-186',
  templateUrl: './hero-186.component.html',
  styleUrls: ['./hero-186.component.css']
})
export class Hero186Component {
  @Input() heroId: number = 186;
  name: string = 'Hero 186';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}