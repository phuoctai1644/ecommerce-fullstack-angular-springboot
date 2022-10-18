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

    return this.getProducts(searchURL)
  }

  searchProducts(keyword: string): Observable<Array<Product>> {
    const searchURL = `${this.baseURL}/search/findByNameContaining?name=${keyword}`

    return this.httpClient.get<GetResponseProducts>(searchURL).pipe(
      map(res => res._embedded.products)
    )
  }

  searchProductsPaginate(
    page: number, 
    pageSize: number,
    keyword: string
  ): Observable<GetResponseProducts> {
    // need to build URL based on keyword, page and size
    const url = `${this.baseURL}/search/findByNameContaining?name=${keyword}` 
              + `&page=${page}&size=${pageSize}`

    return this.httpClient.get<GetResponseProducts>(url)
  }

  private getProducts(searchURL: string): Observable<Product[]> {
    return this.httpClient.get<GetResponseProducts>(searchURL).pipe(
      map(res => res._embedded.products)
    );
  }

  getProductCategories(): Observable<ProductCategory[]> { 
    return this.httpClient.get<GetResponseProductCategory>(this.categoryUrl).pipe(
      map(res => res._embedded.productCategory)
    )
  }

  getProductDetals(id: number): Observable<Product> {
    const productDetailsURL = `${this.baseURL}/${id}`

    return this.httpClient.get<Product>(productDetailsURL)
  }

  getProductListPaginate(
    page: number, 
    pageSize: number,
    categoryId: number
  ): Observable<GetResponseProducts> {
    const url = `${this.baseURL}/search/findByCategoryId?id=${categoryId}` 
              + `&page=${page}&size=${pageSize}`

    return this.httpClient.get<GetResponseProducts>(url)
  }
}

interface GetResponseProducts {
  _embedded: {
    products: Array<Product>
  },
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  }
}

interface GetResponseProductCategory {
  _embedded: {
    productCategory: Array<ProductCategory>
  }
}
