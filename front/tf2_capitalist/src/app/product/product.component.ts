import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  progressbarvalue = 0;
  lastupdate = 0;
  constructor(private router: Router) {
  }
  @Input()
  set prod(value: Product) {
     this.product = value; 
    } 

  startFabrication() {
    this.product.timeleft = this.product.vitesse;
    this.lastupdate = Date.now();
    setInterval(() => { this.calcScore(); }, 100)
  }

  calcScore() {
    if (!(this.product.timeleft == 0)) {
      this.product.timeleft -= Date.now() - this.lastupdate
      if (this.product.timeleft <= 0) {
        this.product.timeleft = 0;
        this.progressbarvalue = 0;
        this.notifyProduction.emit(this.product);
      } else {
        this.progressbarvalue = ((this.product.vitesse - this.product.timeleft) / this.product.vitesse) * 100;
      }
    }
  }

  @Output() notifyProduction: EventEmitter<Product> = new EventEmitter<Product>();
}
  
