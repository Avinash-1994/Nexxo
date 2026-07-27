import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-135',
  templateUrl: './hero-135.component.html',
  styleUrls: ['./hero-135.component.css']
})
export class Hero135Component {
  @Input() heroId: number = 135;
  name: string = 'Hero 135';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}