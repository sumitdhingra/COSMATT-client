import { Injectable } from '@angular/core';
import { Http, URLSearchParams, RequestOptions } from '@angular/http';
import { environment } from '../../../environments/environment';
import { AppDataService } from '../../services/app-data.service';
import { CourseDataService } from './course-data.service';
import { AuthService } from '../../services/auth.service';


@Injectable()
export class ProductService {
  products: Map<String, any>;
  productJSON: JSON;
  learningObjectives :Map<String, any>;

  constructor(private http: Http,
    private appDataService: AppDataService,
    private courseDataService: CourseDataService,
    private authService: AuthService) {
    this.products = new Map();
    this.learningObjectives = new Map();

    this.authService.loggedOut.subscribe(() => this.clearData());
  }

  public getProduct(details: boolean = true): Promise<JSON> {
    return new Promise((resolve, reject) => {

      const productId = this.courseDataService.getProductId();
      let productJSON = this.products.get(productId);
      if (productJSON){
        this.productJSON = productJSON;
        resolve(this.productJSON);
        return;
      } 


      const params = new URLSearchParams();
      params.set('userid', this.appDataService.getUser()['userId']);
      params.set('productid', productId);
      this.http.get(environment.API_URL + 'product/user-products', { search: params }).toPromise().then(res => {
        if (typeof res['_body'] === 'string') {
          this.productJSON = JSON.parse(res['_body']);
          this.products.set(productId, this.productJSON );
        } else {
          this.productJSON = res['_body'];
          this.products.set(productId, this.productJSON );
        }
        this.fetchLearningObjective()
        .then((learningObjectives)=>{
          this.learningObjectives.set(productId, learningObjectives);
          //Apply theme if user refresh the page.
          let theme = this.getProductTheme();
          this.courseDataService.applyProductTheme(productId, theme)
          resolve(this.productJSON);
        })
        
      }).then(()=>{
        return ;
      }).catch(err => {
        console.error(err);
      });
    });
  }
  public fetchLearningObjective(){
    return new Promise((resolve, reject) => {
      let aboutCourse = this.getIntroModel()[3].json.url;
      let publicAssetsPath = this.getPublicAssetsPath();
      let aboutCourseURL = publicAssetsPath + '/' + aboutCourse;
      let options = new RequestOptions({ withCredentials: false });

      this.http.get(aboutCourseURL, options).toPromise().then((response) => {
        let learningObjectives;
        if (typeof response['_body'] === 'string') {
          learningObjectives = JSON.parse(response['_body']);
        } else {
          learningObjectives = response['_body'];
          
        }
        resolve(this.updateLearningObjectives(learningObjectives));
      }).catch(error => {
        reject(error);
      })
    })
    
  }
  public getProductTheme(){
    let meta = this.getProductMeta();
    if(meta.model && meta.model.theme){
      return meta.model.theme;
    }
    return;
  }
  public getIntroModel() {
    if (this.productJSON) {
      return this.productJSON['itemsbymodel'];
    }
  }

  public getProductMeta() {
    if (this.productJSON) {
      return this.productJSON['meta'];
    }
  }

  public getObjectives() {
    const productId = this.courseDataService.getProductId();
    let learningObjectives = this.learningObjectives.get(productId);
    if (learningObjectives){
      return learningObjectives;
    }else{
      return;
    }
}


  
  /** getAboutPageObjectives function is added to show learning objective in sequence as display in course.
   * Currently, DLS API returning learning objective after sorting in alphabetically
   * JIRA ID to track this issue is :https://compro.atlassian.net/browse/COSMATT-1665
   **/
  // Commenting below code for pearsonacct as LOs are different
  // public getAboutPageObjectives() {
  //   return this.learningObjectives = [
  //     'Gain adequate knowledge of the principles of accounting'
  //   ];
  // }
  
  private updateLearningObjectives(LOResourceObjectives): any {
    for (var i = 0; i < LOResourceObjectives['learning-objectives'].length; i++) {
      for (var j = 0; j < LOResourceObjectives['learning-objectives'][i]['learning-objectives'].length; j++) {
        var id = LOResourceObjectives['learning-objectives'][i]['learning-objectives'][j]['id'];
        if ((Object.keys(this.productJSON['objectives'])).indexOf(id) > -1) {
          LOResourceObjectives['learning-objectives'][i]['learning-objectives'][j]['__analytics'] = this.productJSON['objectives'][id]['__analytics'];
        }
      }
    }
    return LOResourceObjectives;
  }


  public getTags() {
    if (this.productJSON) {
      return this.productJSON['tags'];
    }
  }

  public getProductDetails() {
    if (this.productJSON) {
      return this.productJSON;
    }
  }

  public getPublicAssetsPath() {
    if (this.productJSON) {
      return this.productJSON['meta']['paths']['public-assets'];
    }
  }

  public getPublicCssPath() {
    if (this.productJSON) {
      return this.productJSON['csspath'];
    }
  }

  public clearData() {
    this.productJSON = undefined;
  }

  public applyNumberFormatter(){
    let meta = this.getProductMeta();
    if(meta.model && meta.model.numberFormatter){
      return true;
    }
    return false;
  }

}
