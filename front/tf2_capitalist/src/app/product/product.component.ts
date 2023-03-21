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
  _qtmulti = "";
  _money = 0;
  timedisplay = "00:00:00";
  constructor(private router: Router) { }
  @Input()
  set prod(value: Product) {
    this.product = value;
  }

  @Input()
  set qtmulti(value: string) {
    this._qtmulti = value;
    if (this._qtmulti && this.product) this.calcMaxCanBuy();
  }
  
  @Input()
  set money(value: number) {
    this._money = value;
  }
  
  calcMaxCanBuy() {
    return null;
  }

  ngOnInit() {
    setInterval(() => { this.calcScore(); }, 100)
  }

  startFabrication() {
    this.product.timeleft = this.product.vitesse;
    this.lastupdate = Date.now();
  }

  calcScore() {
    if (!(this.product.timeleft == 0)) {
      this.product.timeleft -= Date.now() - this.lastupdate
      console.log(this.product.timeleft);
      if (this.product.timeleft <= 0) {
        this.product.timeleft = 0;
        this.progressbarvalue = 0;
        this.timedisplay = "00:00:00"
        this.notifyProduction.emit(this.product);
      } else {
        this.progressbarvalue = ((this.product.vitesse - this.product.timeleft) / this.product.vitesse) * 100;
        this.timedisplay = this.convertToTime(this.product.timeleft);
      }
    }
  }

  convertToTime(timeleft: number): string {
    var hours = Math.floor((timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((timeleft % (1000 * 60)) / 1000);
    var strhours =  hours < 10 ? '0' + hours : hours;
    var strmin = minutes < 10 ? '0' + minutes : minutes;
    var strsec = seconds < 10 ? '0' + seconds : seconds;
    return strhours+": "+strmin+": "+strsec;
  }
  @Output() notifyProduction: EventEmitter<Product> = new EventEmitter<Product>();
}


