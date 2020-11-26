import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { ProductService } from '../services/product.service';
import '../../services/rxjs-operators.service';
import { CourseDataService } from '../services/course-data.service';

@Injectable()
export class CourseIntroductionService {
  aboutCourseMdContent: Map<String, String>;
  authorsData: Map<String, Array<any>>;
  forewordMdContent: Map<String, String>;

  constructor(private http: Http,
    private productService: ProductService,
    private courseDataService: CourseDataService,) {
    this.aboutCourseMdContent = new Map();
    this.forewordMdContent = new Map();
    this.authorsData = new Map();
  }


  getAboutCourseData(): any {
    const productId = this.courseDataService.getProductId();
    const aboutContent = this.aboutCourseMdContent.get(productId);
    if (aboutContent) return aboutContent;

    let aboutCourse = this.productService.getIntroModel()[0].md.url;
    let publicAssetsPath = this.productService.getPublicAssetsPath();
    let aboutCourseURL = publicAssetsPath + '/' + aboutCourse;
    let options = new RequestOptions({ withCredentials: false });

    return this.http.get(aboutCourseURL, options).toPromise()
      .then((res) => {
        this.aboutCourseMdContent.set(productId, res['_body']);
        return res['_body'];
      })
      .catch((error) => {
        console.log(error);
      });
  }
  getForewordData(): any {
    const productId = this.courseDataService.getProductId();
    const forwardContent = this.forewordMdContent.get(productId);
    if (forwardContent) return forwardContent;

    let forewordMd = this.productService.getIntroModel()[1].md.url;
    let publicAssetsPath = this.productService.getPublicAssetsPath();
    let forewordURL = publicAssetsPath + '/' + forewordMd;
    let options = new RequestOptions({ withCredentials: false });

    return this.http.get(forewordURL, options).toPromise()
      .then((res) => {
        this.forewordMdContent.set(productId, res['_body']);
        return res['_body'];
      })
      .catch((error) => {
        console.log(error);
      });
  }
  getAuthorsData(): any {
    const productId = this.courseDataService.getProductId();
    const authorContent = this.authorsData.get(productId);
    if (authorContent) return authorContent;

    let courseAuthorDetails = this.productService.getProductMeta()['authors'];
    let publicAssetsPath = this.productService.getPublicAssetsPath();
    let PromiseArray = [];
    let options = new RequestOptions({ withCredentials: false });
    for (let i = 0; i < courseAuthorDetails.length; i++) {
      PromiseArray[i] = this.http.get(publicAssetsPath + '/' + courseAuthorDetails[i]['asseturl'], options).toPromise();
    }
    return Promise.all(PromiseArray).then((res) => {
      for (let i = 0; i < courseAuthorDetails.length; i++) {
        courseAuthorDetails[i]['mdContent'] = res[i]['_body'];
      }
      this.authorsData.set(productId, courseAuthorDetails);
      return courseAuthorDetails;

    })
      .catch((error) => {
        console.log(error);
      });

  }
  getTitleData(): any {
    return this.productService.getIntroModel()[2];
  }
  getLeftMenu(): any {
    return [
      { id: 'titleAuthor', text: 'Title' },
      { id: 'introduction', text: 'Introduction ' },
      { id: 'courseContent', text: 'Contents' },
      { id: 'foreword', text: 'Foreword' }

    ];
  }
}
