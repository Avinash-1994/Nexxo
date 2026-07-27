import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-150',
  templateUrl: './hero-150.component.html',
  styleUrls: ['./hero-150.component.css']
})
export class Hero150Component {
  @Input() heroId: number = 150;
  name: string = 'Hero 150';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}