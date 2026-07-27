import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-194',
  templateUrl: './hero-194.component.html',
  styleUrls: ['./hero-194.component.css']
})
export class Hero194Component {
  @Input() heroId: number = 194;
  name: string = 'Hero 194';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}