import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-58',
  templateUrl: './hero-58.component.html',
  styleUrls: ['./hero-58.component.css']
})
export class Hero58Component {
  @Input() heroId: number = 58;
  name: string = 'Hero 58';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}