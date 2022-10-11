import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Product } from '../common/product';
import { ProductCategory } from '../common/product-category';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseURL: string = 'http://localhost:8080/api/products'
  private categoryUrl: string = 'http://localhost:8080/api/product-category'

  constructor(private httpClient: HttpClient) { }

  getProductList(theCategoryId: number): Observable<Product[]> {

    // @TODO: need to build URL base categoryID
    const searchURL = `${this.baseURL}/search/findByCategoryId?id=${theCategoryId}` 

    return this.httpClient.get<GetResponseProducts>(searchURL).pipe(
      map(res => res._embedded.products)
    )
  }

  getProductCategories(): Observable<ProductCategory[]> {
    return this.httpClient.get<GetResponseProductCategory>(this.categoryUrl).pipe(
      map(res => res._embedded.productCategory)
    )
  }
}

interface GetResponseProducts {
  _embedded: {
    products: Array<Product>
  }
}

interface GetResponseProductCategory {
  _embedded: {
    productCategory: Array<ProductCategory>
  }
}
