import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-42',
  templateUrl: './hero-42.component.html',
  styleUrls: ['./hero-42.component.css']
})
export class Hero42Component {
  @Input() heroId: number = 42;
  name: string = 'Hero 42';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}