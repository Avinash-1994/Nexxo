import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  template: `
    <article>
      <h1>{{ title }}</h1>
      <p class="content">{{ content }}</p>
    </article>
  `
})
export default class BlogPostComponent {
  @Input() slug!: string;
  
  get title() {
    return this.slug === 'hello-analog' ? 'Hello Analog' : 'Lunx Build Integration';
  }
  
  get content() {
    return 'This is the content for ' + this.slug;
  }
}
