import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-128',
  templateUrl: './hero-128.component.html',
  styleUrls: ['./hero-128.component.css']
})
export class Hero128Component {
  @Input() heroId: number = 128;
  name: string = 'Hero 128';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}