import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-172',
  templateUrl: './hero-172.component.html',
  styleUrls: ['./hero-172.component.css']
})
export class Hero172Component {
  @Input() heroId: number = 172;
  name: string = 'Hero 172';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}