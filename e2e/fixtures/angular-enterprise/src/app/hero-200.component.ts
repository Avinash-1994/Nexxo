import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-200',
  templateUrl: './hero-200.component.html',
  styleUrls: ['./hero-200.component.css']
})
export class Hero200Component {
  @Input() heroId: number = 200;
  name: string = 'Hero 200';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}