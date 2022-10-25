import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { OrderHistory } from '../common/order-history';

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {

  private orderUrl = `${environment.luv2shopApiUrl}/orders`
  
  constructor(private httpClient: HttpClient) { }

  getOrderHistory(email: string): Observable<GetResponseOrderHistory> {
    console.log('started')
    // Need to build URL based on the customer email
    const orderHistoryUrl = `${this.orderUrl}/search/findByCustomerEmailOrderByDateCreatedDesc?email=${email}`

    console.log(orderHistoryUrl)

    return this.httpClient.get<GetResponseOrderHistory>(orderHistoryUrl)
  }

}

interface GetResponseOrderHistory {
  _embedded: {
    orders: OrderHistory[]
  }
}
