import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-163',
  templateUrl: './hero-163.component.html',
  styleUrls: ['./hero-163.component.css']
})
export class Hero163Component {
  @Input() heroId: number = 163;
  name: string = 'Hero 163';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}