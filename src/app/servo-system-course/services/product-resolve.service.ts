import { ClassDataService } from './class-data.service';
import { Injectable } from '@angular/core';
import { Router, Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { ProductService } from './product.service';
import { CourseDataService } from 'app/servo-system-course/services/course-data.service';

@Injectable()
export class ProductResolveService implements Resolve<any> {

  constructor(private router: Router, private productService: ProductService,
    private courseDataService: CourseDataService,
    private classDataService: ClassDataService) { }
  resolve(route: ActivatedRouteSnapshot): Promise<any> | boolean {
    if (!this.courseDataService.getProductId() && route.params.id) {
      this.courseDataService.setProductId(route.params.id);
    }
    if (!this.classDataService.ActiveClass && route.params.class) {
      this.classDataService.ActiveClass = route.params.class;
    }
    return this.productService.getProduct().catch((err) => {
      if (err.status === 403) {
        this.router.navigate(['auth/login']);
      } else {
        throw err;
      }
    }).then((product) => {
      if (product)
        this.courseDataService.setProductName(product["meta"].title);
      this.courseDataService.setProductLogoPath(product["meta"].thumbnaillarge);
      this.courseDataService.setPublicAssetsPath(product["meta"]["paths"]["public-assets"]);
    });
  }
}
