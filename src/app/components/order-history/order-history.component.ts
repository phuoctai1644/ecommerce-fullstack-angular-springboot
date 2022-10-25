import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { OrderHistory } from 'src/app/common/order-history';
import { OrderHistoryService } from 'src/app/services/order-history.service';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
  orderHistoryList: OrderHistory[] = []
  storage: Storage = sessionStorage

  constructor(private orderHistoryService: OrderHistoryService) { }

  ngOnInit(): void {
    this.handleOrderHistory()
  }
  handleOrderHistory() {
    // Read the user's email address from browser storage
    const email = JSON.parse(this.storage.getItem('userEmail')!)
    
    // Retrieve data from the service
    this.orderHistoryService.getOrderHistory(email).subscribe(
      data => {
        this.orderHistoryList = data._embedded.orders 
      }
    )
  }

}
