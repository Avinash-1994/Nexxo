import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-104',
  templateUrl: './hero-104.component.html',
  styleUrls: ['./hero-104.component.css']
})
export class Hero104Component {
  @Input() heroId: number = 104;
  name: string = 'Hero 104';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}