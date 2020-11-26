import { 
    Component, 
    OnInit,
    ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppDataService } from '../../services/app-data.service';
import { environment } from '../../../environments/environment';
import { Http } from '@angular/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-resetuseraccount',
  templateUrl: './resetuseraccount.component.html',
  styleUrls: ['./resetuseraccount.component.scss']
})
export class ResetuseraccountComponent implements OnInit {

  $el: any;
  success: any;
  resetStart: any;

  constructor(
    private domEle: ElementRef,
    private router: Router,
    private route: ActivatedRoute,
    private appDataService: AppDataService,
    private http: Http,
    private authService: AuthService
  ) { 
    this.$el = jQuery(domEle.nativeElement);
  }

  ngOnInit() {
    this.$el.find('#reportModal').modal('show');
  }
  
  resetMyAccount(){
    if(this.success != undefined){
      this.$el.find('#reportModal').modal('hide');
      this.router.navigateByUrl('/auth/login');
    }else{
      this.resetStart = true;
      this.resetUserAccount();
    }
  }

  cancellingResetMyAccount(){
    console.log("Cancelling reset request");
    this.router.navigate(['..'], {relativeTo: this.route});
  }

  resetUserAccount(){
    let userDetails = this.appDataService.getUser();
    let userData = {
      email: userDetails.email,
      name: userDetails.name,
      userId: userDetails.userId
    }
    
    const resetUserAccountURL = environment.API_URL + "auth/resetUserAcccount";
    this.http.post(resetUserAccountURL, userData)
    .toPromise()
    .then((res)=>{
      console.log("Successfull in resetting user account");
      this.authService.logout();
      this.success = true;
      this.resetStart = false;
    })
    .catch((err)=>{
      console.log("Error in resetting user account");
      this.success = false;
      this.resetStart = false;
      this.authService.logout();
    });
  }
}
