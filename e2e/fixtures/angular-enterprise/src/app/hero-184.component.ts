import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-184',
  templateUrl: './hero-184.component.html',
  styleUrls: ['./hero-184.component.css']
})
export class Hero184Component {
  @Input() heroId: number = 184;
  name: string = 'Hero 184';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}