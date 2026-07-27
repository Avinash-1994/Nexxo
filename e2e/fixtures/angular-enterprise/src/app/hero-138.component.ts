import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-138',
  templateUrl: './hero-138.component.html',
  styleUrls: ['./hero-138.component.css']
})
export class Hero138Component {
  @Input() heroId: number = 138;
  name: string = 'Hero 138';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}