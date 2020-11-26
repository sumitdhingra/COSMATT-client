import { Component, OnInit, ElementRef, Input } from '@angular/core';

@Component({
  selector: 'app-gravatar',
  templateUrl: './gravatar.component.html',
  styleUrls: ['./gravatar.component.scss']
})
export class GravatarComponent implements OnInit {

  @Input('gravatar-picture-url') gravatarPictureUrl: string;
  @Input('user-basics') userBasics: any;

  constructor(
    private elemRef: ElementRef
  ) {
  }

  ngOnInit() {
  }
}
