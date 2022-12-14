import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CartItem } from '../common/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartItems: CartItem[] = []

  totalPrice: Subject<number> = new BehaviorSubject<number>(0)
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0)

  storage: Storage = sessionStorage

  constructor() {
    // Read data from storage
    let data = JSON.parse(this.storage.getItem('cartItems')!)

    if (data != null) {
      this.cartItems = data

      // compute totals based on the data that is read from storage
      this.computeCartTotals()
    }
  }

  persistCartItems() {
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems))
  } 

  addToCart(theCartItem: CartItem) {
    let alreadyExistsInCart: boolean = false
    let existingCartItem: CartItem | undefined

    if (this.cartItems.length > 0) {
      existingCartItem = this.cartItems.find(tempCartItem => tempCartItem.id === theCartItem.id)
    }

    alreadyExistsInCart = (existingCartItem != undefined)
    
    if (alreadyExistsInCart && existingCartItem) {
      existingCartItem.quantity++
    } else {
      this.cartItems.push(theCartItem)
    }

    this.computeCartTotals()
  }

  computeCartTotals() {
    let totalPriceValue: number = 0.00
    let totalQuantityValue: number = 0

    for (let currentCartItem of this.cartItems) {
      totalPriceValue += currentCartItem.unitPrice * currentCartItem.quantity
      totalQuantityValue += currentCartItem.quantity
    }

    // Publish the new value
    this.totalPrice.next(totalPriceValue)
    this.totalQuantity.next(totalQuantityValue) 

    // Log cart data just for debugging purposes
    this.logCartData(totalPriceValue, totalQuantityValue)

    // Persist cart data
    this.persistCartItems()
  }

  decrementQuantity(cartItem: CartItem) {
    console.log(this.cartItems)

    cartItem.quantity--

    console.log(this.cartItems)
    
    if (cartItem.quantity === 0) {
      this.remove(cartItem)
    } else {
      this.computeCartTotals()
    }
  }

  remove(cartItem: CartItem) {
    const itemIndex = this.cartItems.findIndex(tempCartItem => tempCartItem.id === cartItem.id)

    if (itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1)  
      this.computeCartTotals()
    }
  }

  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    console.log('Contents of the cart');
    for (let tempCartItem of this.cartItems) {
      const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice;
      console.log(`name: ${tempCartItem.name}, quantity=${tempCartItem.quantity}, unitPrice=${tempCartItem.unitPrice}, subTotalPrice=${subTotalPrice}`);
    }

    console.log(`totalPrice: ${totalPriceValue.toFixed(2)}, totalQuantity: ${totalQuantityValue}`);
    console.log('----');
  }
}
