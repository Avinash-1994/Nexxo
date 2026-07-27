import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-178',
  templateUrl: './hero-178.component.html',
  styleUrls: ['./hero-178.component.css']
})
export class Hero178Component {
  @Input() heroId: number = 178;
  name: string = 'Hero 178';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}