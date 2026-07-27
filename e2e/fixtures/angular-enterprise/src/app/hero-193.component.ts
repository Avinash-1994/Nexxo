import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-193',
  templateUrl: './hero-193.component.html',
  styleUrls: ['./hero-193.component.css']
})
export class Hero193Component {
  @Input() heroId: number = 193;
  name: string = 'Hero 193';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}