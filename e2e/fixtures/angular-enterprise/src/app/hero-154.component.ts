import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-154',
  templateUrl: './hero-154.component.html',
  styleUrls: ['./hero-154.component.css']
})
export class Hero154Component {
  @Input() heroId: number = 154;
  name: string = 'Hero 154';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}