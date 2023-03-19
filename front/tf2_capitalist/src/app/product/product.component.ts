import { Component, Input } from '@angular/core';
import { Product } from '../world';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent {
  product: Product = new Product; 
  server = 'http://localhost:4000';
  constructor(private router: Router) {
  }
  @Input()
  set prod(value: Product) {
     this.product = value; 
    } 
}
  
