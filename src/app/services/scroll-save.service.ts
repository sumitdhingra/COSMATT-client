import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { AppDataService } from 'app/services/app-data.service';
import { Subscription } from 'rxjs/Subscription';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Location } from '@angular/common';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';

@Injectable()
export class ScrollSaveService implements OnDestroy {

    // Maps URLs to scroll position
    private _routeScrollPositions: {[url: string]: number} = {};
    // Stores the subscriptions
    private _subscriptions: Subscription[] = [];
    // URLs for which scroll positions will not be saved
    public ignoredUrls: string[] = [];

    // Handles localStorage save and retrieve
    get scrollPositionsJson(): {[url: string]: number} {
        return JSON.parse(localStorage.getItem('scroll-positions'));
      }
    set scrollPositionsJson(json: {[url: string]: number}) {
        localStorage.setItem('scroll-positions', JSON.stringify(json));
    }

    constructor(
        private router: Router,
        private location: Location
    ) {
        // If scroll positions are available, load them from localStorage
        if ( this.scrollPositionsJson ) {
            this._routeScrollPositions = this.scrollPositionsJson;
        }

         // Add all the subscriptions to array
        this._subscriptions.push(
            // Subscribe to store scroll positions if events come in pair of (NavigationStart, NavigationEnd)
            this.storeScrollPositionSubscription(),
            // Subscribe to scroll-to the already stored position if event is NavigationEnd
            this.scrollToPositionSubscription()
        );
    }

    ngOnDestroy() {
        // Unsubscribe the subscriptions
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    // To be used in scroll position save (https://github.com/angular/angular/issues/10929)
    storeScrollPositionSubscription(): Subscription {
        // save scroll position on route change
        return this.router.events.pairwise().subscribe(([prevRouteEvent, currRouteEvent]) => {
            if (prevRouteEvent instanceof NavigationEnd && currRouteEvent instanceof NavigationStart) {
                // url path without parameters
                const urlPath = (prevRouteEvent.urlAfterRedirects || prevRouteEvent.url ).split(';', 1)[0];

                // Check if current path does not endsWith an ignoredUrl path
                if ( !this.ignoredUrls.some(ignoredUrl => urlPath.endsWith(ignoredUrl)) ) {
                  this._routeScrollPositions[urlPath] = window.pageYOffset;

                  // Schedule localStorage save
                  setTimeout(() => {
                    this.saveScrollPositionsToLocalStorage();
                  }, 0);
                }
            }
        });
    }

    // On every NavigationEnd event, check if it's scroll position is saved. If yes, scroll to that position
    scrollToPositionSubscription(): Subscription {
        return this.router.events.filter(event => event instanceof NavigationEnd)
        .subscribe((navigationEndEvent: NavigationEnd) => {

            // Get current URL
            const urlPath = (navigationEndEvent.urlAfterRedirects || navigationEndEvent.url).split(';', 1)[0];

             // Check if current path does not endsWith an ignoredUrl path
             if ( !this.ignoredUrls.some(ignoredUrl => urlPath.endsWith(ignoredUrl)) ) {
               // Schedule a scrollTo event.
               const scrollTimeout = setTimeout(() => {
                 const savedPageYOffset = this._routeScrollPositions[urlPath] || 0;

                 // Upper limit on further scrolling so that it does not get stuck forever
                 let timerExpired = false;
                 setTimeout(() => { timerExpired = true; }, 2000);

                 // Keep checking every 250ms if the scroll is same as saved scroll or not; Once confirmed, clear the interval.
                 const intv = setInterval(() => {
                   // If scroll is already at the end
                   if ((window.innerHeight + window.pageYOffset >= document.body.offsetHeight)
                     || window.pageYOffset === savedPageYOffset
                     || timerExpired
                   ) {
                     clearInterval(intv);
                   }
                   window.scrollTo(0, savedPageYOffset);
                 }, 50);
               }, 250);
             }

            // Detect if user has started scrolling on page visit.
            // const userScrollSubscription: Subscription = Observable.fromEvent(window, 'scroll').subscribe((event) => {
            //   console.log('User scroll detected');
            //   clearTimeout(scrollTimeout);
            //   userScrollSubscription.unsubscribe();
            // });
        });
    }

    // Determines if current page's scroll position does not match the object-url mapped position ( not localStorage )
    isScrollPositionChanged(): boolean {
        const urlPath = this.location.path().split(';', 1)[0];
        if ( +this._routeScrollPositions[urlPath] === window.pageYOffset ) {
            return false;
        } else {
            return true;
        }
    }

    // Saves the scroll position of current page by updating local object
    saveScrollPositionOfCurrentPage(): void {
        const urlPath = this.location.path().split(';', 1)[0];
        this._routeScrollPositions[urlPath] = window.pageYOffset;
    }

    // Saves scroll position to localStorage
    saveScrollPositionsToLocalStorage(): void {
        this.scrollPositionsJson = this._routeScrollPositions;
    }
}
