import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-136',
  templateUrl: './hero-136.component.html',
  styleUrls: ['./hero-136.component.css']
})
export class Hero136Component {
  @Input() heroId: number = 136;
  name: string = 'Hero 136';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}