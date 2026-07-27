import { Component } from '@angular/core';
import { AsyncPipe, NgFor } from '@angular/common';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [AsyncPipe, NgFor],
  template: `
    <h2>Latest Posts</h2>
    <ul>
      <li><a href="/blog/hello-analog">Hello Analog</a></li>
      <li><a href="/blog/lunx-build">Lunx Build Integration</a></li>
    </ul>
  `
})
export default class HomePageComponent {}
