import { ErrorHandler } from '@angular/core';

export class BugsnagErrorHandler implements ErrorHandler {
  handleError(error: any) {
    Bugsnag.notifyException(error, {
      angular: !error.ngDebugContext
        ? undefined
        : { component: error.ngDebugContext.component, context: error.ngDebugContext.context }
    });
    // to be removed - caused by leonardo on each click
    if (error.message === "Cannot read property 'parentNode' of null") {
      return;
    }
    console.error(error);
  }
}
