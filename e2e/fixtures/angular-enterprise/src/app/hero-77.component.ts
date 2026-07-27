import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-77',
  templateUrl: './hero-77.component.html',
  styleUrls: ['./hero-77.component.css']
})
export class Hero77Component {
  @Input() heroId: number = 77;
  name: string = 'Hero 77';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}