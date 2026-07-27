import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-123',
  templateUrl: './hero-123.component.html',
  styleUrls: ['./hero-123.component.css']
})
export class Hero123Component {
  @Input() heroId: number = 123;
  name: string = 'Hero 123';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}