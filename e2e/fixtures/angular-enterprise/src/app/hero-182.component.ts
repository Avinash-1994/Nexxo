import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-182',
  templateUrl: './hero-182.component.html',
  styleUrls: ['./hero-182.component.css']
})
export class Hero182Component {
  @Input() heroId: number = 182;
  name: string = 'Hero 182';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}