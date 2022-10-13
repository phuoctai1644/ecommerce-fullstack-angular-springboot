import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] = []
  currentCategoryId: number = 1
  searchMode: boolean = false
  previousCategoryId: number = 1
  previousKeyword: string = ""

  // Properties for pagination
  pageNumber: number = 1
  pageSize: number = 10
  totalElements: number = 0 
  
  constructor(private productService: ProductService,
              private cartService: CartService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts()
    })
  }
  listProducts() {
    this.searchMode = this.route.snapshot.paramMap.has('keyword')

    if (this.searchMode) {
      this.handleSearchProducts()
    } else {
      this.handleListProducts()
    }
  }

  handleSearchProducts() {
    const theKeyword: string = this.route.snapshot.paramMap.get('keyword')!

    // Search for the products using keyword
    this.productService.searchProducts(theKeyword).subscribe(
      data => {
        this.products = data
      }
    )

    // If we have a different keyword than previous => set pageNumber to 1
    if (this.previousKeyword != theKeyword) {
      this.pageNumber = 1
    }
    this.previousKeyword = theKeyword

    console.log(`keyword=${theKeyword}, thePageNumber=${this.pageNumber}`)
  
    this.productService.searchProductsPaginate(
      this.pageNumber - 1,
      this.pageSize,
      theKeyword
    ).subscribe(this.processResult())
  }

  handleListProducts() {
    // Check if 'id' parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id')

    if (hasCategoryId) {
      this.currentCategoryId = Number(this.route.snapshot.paramMap.get('id'))
    } else {
      // Not category id available -> default to category id 1
      this.currentCategoryId = 1
    }

    // *** Without Pagination ***
    
    // Get the products for the given category id 
    // this.productService.getProductList(this.currentCategoryId).subscribe(
    //   data => {
    //     this.products = data
    //   }
    // )
    
    /**
     * Check if we have a different category then previous
     * Note: Angular will reuse a component if it is currently being viewed 
     */    

    /**
     * If we have different category id than previous 
     * -> then set the pageNumber back to 1
     */
    if (this.previousCategoryId != this.currentCategoryId) {
      this.pageNumber = 1
    }
    this.previousCategoryId = this.currentCategoryId

    // Console for debug
    console.log(`currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.pageNumber}`)

    this.productService.getProductListPaginate(
      this.pageNumber - 1,
      this.pageSize, 
      this.currentCategoryId
    ).subscribe(this.processResult())
  }

  updatePageSize(newPageSize: string) {
    // Convert string to number using '+'
    this.pageSize = +newPageSize
    this.pageNumber = 1
    this.listProducts()
  }

  processResult() {
    return (data: any) => {
      this.products = data._embedded.products,
      this.pageNumber = data.page.number + 1,
      this.pageSize = data.page.size,
      this.totalElements = data.page.totalElements
    }
  }

  addToCart(product: Product) {
    console.log(`Adding to cart: ${product.name}, ${product.unitPrice}`)

    // TODO ... do the real work
    const cartItem = new CartItem(product);

    this.cartService.addToCart(cartItem);
  }
}
