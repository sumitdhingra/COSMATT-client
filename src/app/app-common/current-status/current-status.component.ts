// import { Component, OnInit, Input } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// @Component({
//   selector: 'app-current-status',
//   templateUrl: './current-status.component.html',
//   styleUrls: ['./current-status.component.scss']
// })
// export class CurrentStatusComponent implements OnInit {

//   @Input() courseStatus;
//   @Input() currentStatus;

//   constructor(private activatedRoute: ActivatedRoute, private router: Router) { };

//   ngOnInit() {
//     if (this.currentStatus === undefined) {
//       this.currentStatus = {
//         'module': 0,
//         'chapter': 0,
//         'title': 'Fundamentals - Mass',
//         'pretestflag': 'true'
//       };
//     }
    
//   };
//   resumeBtnClicked(e) {
//     this.router.navigate(['../content', this.currentStatus.module, this.currentStatus.chapter], { relativeTo: this.activatedRoute });
//   }
// }
