import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-153',
  templateUrl: './hero-153.component.html',
  styleUrls: ['./hero-153.component.css']
})
export class Hero153Component {
  @Input() heroId: number = 153;
  name: string = 'Hero 153';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}