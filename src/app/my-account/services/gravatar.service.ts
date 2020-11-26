import { Injectable } from '@angular/core';
let gravatar = require('gravatar');

@Injectable()
export class GravatarService {

  constructor() { }

  getGravatarUrl(emailId: string = 'email@example.com', pictureSize: string = '80'): string {
      return gravatar.url(emailId, {s: pictureSize}, true);
  }
}
