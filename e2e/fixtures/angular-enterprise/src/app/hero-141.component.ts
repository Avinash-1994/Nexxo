import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-141',
  templateUrl: './hero-141.component.html',
  styleUrls: ['./hero-141.component.css']
})
export class Hero141Component {
  @Input() heroId: number = 141;
  name: string = 'Hero 141';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}