import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/common/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] = []
  currentCategoryId: number = 1;
  constructor(private productService: ProductService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts()
    })
  }
  listProducts() {
    // Check if 'id' parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id')

    if (hasCategoryId) {
      // Get the 'id' param string -> Convert string to a number using "+" symbol
      this.currentCategoryId = Number(this.route.snapshot.paramMap.get('id'))
    } else {
      // Not category id available -> default to category id 1
      this.currentCategoryId = 1
    }

    // Get the products for the given category id 
    this.productService.getProductList(this.currentCategoryId).subscribe(
      data => {
        this.products = data
      }
    )
  }

}
