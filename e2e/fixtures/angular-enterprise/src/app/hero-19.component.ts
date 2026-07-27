import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-19',
  templateUrl: './hero-19.component.html',
  styleUrls: ['./hero-19.component.css']
})
export class Hero19Component {
  @Input() heroId: number = 19;
  name: string = 'Hero 19';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}