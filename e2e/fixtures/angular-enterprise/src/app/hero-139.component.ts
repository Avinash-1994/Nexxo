import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-139',
  templateUrl: './hero-139.component.html',
  styleUrls: ['./hero-139.component.css']
})
export class Hero139Component {
  @Input() heroId: number = 139;
  name: string = 'Hero 139';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}