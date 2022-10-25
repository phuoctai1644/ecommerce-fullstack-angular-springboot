import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { Luv2ShopFormService } from 'src/app/services/luv2-shop-form.service';
import { Luv2ShopValidators } from 'src/app/validators/luv2-shop-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  storage: Storage = sessionStorage

  checkoutFormGroup!: FormGroup

  totalPrice: number = 0
  totalQuantity: number = 0

  creditCardMonths: number[] = []
  creditCardYears: number[] = []

  countries!: Country[]

  shippingAddressStates: State[] = []
  billingAddressStates: State[] = []

  constructor(private formBuilder: FormBuilder,
              private cartService: CartService,
              private luv2ShopFormService: Luv2ShopFormService, 
              private checkoutService: CheckoutService,
              private router: Router) { }

  ngOnInit(): void {
    // Read the user's email address from browser storage 
    const email = JSON.parse(this.storage.getItem('userEmail')!)

    this.reviewCartDetails()

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [
          Validators.required, 
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhiteSpace 
        ]),
        lastName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhiteSpace
        ]),
        email: new FormControl(email, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9._]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        country: new FormControl('', [Validators.required]),
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhiteSpace
        ]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhiteSpace
        ]),
        state: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhiteSpace
        ])
      }),
      billingAddress: this.formBuilder.group({
        country: new FormControl('', [Validators.required]),
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhiteSpace
        ]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhiteSpace
        ]),
        state: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhiteSpace
        ])
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhiteSpace
        ]),
        cardNumber: new FormControl('', [
          Validators.required,
          Validators.pattern('[0-9]{16}')
        ]),
        securityCode: new FormControl('', [
          Validators.required,
          Validators.pattern('[0-9]{3}')
        ]),
        expirationMonth: new FormControl('', [Validators.required]),
        expirationYear: new FormControl('', [Validators.required]), 
      })
    })

    // Populate credit card months
    const startMonth: number = new Date().getMonth() + 1

    this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log('Retrieved credit card months: ' + JSON.stringify(data))
        this.creditCardMonths = data 
      }
    )

    // Populate credit card years
    this.luv2ShopFormService.getCreditCardYears().subscribe(
      data => {
        console.log('Retrieved credit card years: ' + JSON.stringify(data))
        this.creditCardYears = data 
      }
    )

    // Populate countries
    this.luv2ShopFormService.getCountries().subscribe(
      data => {
        console.log('Retrieved countries: ' + JSON.stringify(data))
        this.countries = data
      }
    )
  }
  
  reviewCartDetails() {
    this.cartService.totalQuantity.subscribe(
      data => this.totalQuantity = data
    )

    this.cartService.totalPrice.subscribe(
      data => this.totalPrice = data
    )
  }

  onSubmit() {
    // console.log(this.checkoutFormGroup?.get('customer')?.value)
    console.log(this.checkoutFormGroup?.get('shippingAddress')?.value)

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched()
      return
    }

    // Set up order
    let order = new Order(this.totalPrice, this.totalQuantity)

    // Get cart Items
    const cartItems = this.cartService.cartItems

    // Create orderItems from cartItems
    let orderItems: OrderItem[] = cartItems.map(item => new OrderItem(item))

    // Set up purchase
    let purchase = new Purchase()

    // Populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value
    
    // populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state))
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country))
    purchase.billingAddress.state = billingState.name
    purchase.billingAddress.country = billingCountry.name
    
    // populate purchase - shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state))
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country))
    purchase.shippingAddress.state = shippingState.name
    purchase.shippingAddress.country = shippingCountry.name


    // Populate purchase - order and orderItems
    purchase.order = order
    purchase.orderItems = orderItems

    // Call REST Api
    this.checkoutService.placeOrder(purchase).subscribe(
      {
        next: res => {
          alert(`Your order has been received \nOrder number is: ${res.orderTrackingNumber}`)

          // Reset cart
          this.resetCart()
        },
        error: err => {
          alert(`There was an error: ${err.message}`)
        } 
      }
    )
  }
  resetCart() {
    // Reset cart data
    this.cartService.cartItems = []
    this.cartService.totalPrice.next(0)
    this.cartService.totalQuantity.next(0)

    // Reset form data
    this.checkoutFormGroup.reset()

    // Remove storage
    this.storage.removeItem('cartItems')
    
    // Navigate back to the products page
    this.router.navigateByUrl('/products')
  }

  get firstName() { return this.checkoutFormGroup.get('customer.firstName') }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName') }
  get email() { return this.checkoutFormGroup.get('customer.email') }

  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street')}
  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city')}
  get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state')}
  get shippingAddressZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode')}
  get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country')}

  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street')}
  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city')}
  get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state')}
  get billingAddressZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode')}
  get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country')}

  get creditCardType() { return this.checkoutFormGroup.get('creditCard.cardType') }
  get creditCardNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard') }
  get creditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber') }
  get creditCardSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode') }
  get creditCardExpirationMonth() { return this.checkoutFormGroup.get('creditCard.expirationMonth') }
  get creditCardExpirationYear() { return this.checkoutFormGroup.get('creditCard.expirationYear') }

  copyShippingAddressToBillingAddress(event: any) {
    if (event?.target?.checked) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(this.checkoutFormGroup.controls['shippingAddress'].value)
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset()
    }
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName)
    
    const countryCode = formGroup?.value.country.code
    const countryName = formGroup?.value.country.name

    this.luv2ShopFormService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data
        } else {
          this.billingAddressStates = data
        }

        formGroup?.get('state')?.setValue(data[0])
      }
    )
  }
}
