import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-26',
  templateUrl: './hero-26.component.html',
  styleUrls: ['./hero-26.component.css']
})
export class Hero26Component {
  @Input() heroId: number = 26;
  name: string = 'Hero 26';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}