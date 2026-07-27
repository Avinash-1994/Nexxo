import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-91',
  templateUrl: './hero-91.component.html',
  styleUrls: ['./hero-91.component.css']
})
export class Hero91Component {
  @Input() heroId: number = 91;
  name: string = 'Hero 91';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}