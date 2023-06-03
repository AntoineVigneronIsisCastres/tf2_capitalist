import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../world';
import { Router } from '@angular/router';
import { WebserviceService } from '../webservice.service';

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
  multiplier = 0;
  _money = 0;
  timedisplay = "00:00:00";
  constructor(private router: Router, private service: WebserviceService) { }
  @Input()
  set prod(value: Product) {
    this.product = value; 
    // if (this.product && this.product.timeleft > 0) {
    //   this.lastupdate = Date.now();
    //   let progress = (this.product.vitesse - this.product.timeleft) / this.product.vitesse;
      // this.progressbarvalue.set(progress);
      // this.progressbarvalue.animate(1, { duration: this.product.timeleft }); 
    // } 
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
    switch (this._qtmulti) {
      case 'x1':
        this.multiplier = 1;
        break;
      case 'x10':
        this.multiplier = 10;
        break;
      case 'x100':
        this.multiplier = 100;
        break;
      case 'NEXT':
        this.multiplier = 55;
        break;
      case 'MAX':
        this.multiplier = Math.floor(Math.log(1 - (this._money / this.product.cout) * (1 - this.product.croissance)) / Math.log(this.product.croissance));
        break;
    }
  }

  ngOnInit() {
    setInterval(() => { this.calcScore(); }, 100)
  }

  startFabrication() {
    this.product.timeleft = this.product.vitesse;
    this.lastupdate = Date.now();
  }

  calcScore() {
    if (!(this.product.timeleft == 0) || (this.product.managerUnlocked == true && this.product.timeleft == 0)) {
      this.product.timeleft -= Date.now() - this.lastupdate
      this.lastupdate = Date.now()
      console.log(this.lastupdate)
      if (this.product.timeleft <= 0) {
        if (this.product.managerUnlocked == true) {
          this.startFabrication();
          this.service.lancerProduction(this.product).catch(reason =>
            console.log("erreur: " + reason));
          this.notifyProduction.emit(this.product);
        } else {
          this.product.timeleft = 0;
          this.progressbarvalue = 0;
          this.timedisplay = "00:00:00"
          this.service.lancerProduction(this.product).catch(reason =>
            console.log("erreur: " + reason));
          this.notifyProduction.emit(this.product);
        }
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
    var strhours = hours < 10 ? '0' + hours : hours;
    var strmin = minutes < 10 ? '0' + minutes : minutes;
    var strsec = seconds < 10 ? '0' + seconds : seconds;
    return strhours + ":" + strmin + ":" + strsec;
  }

  buy(multiplier: number) {
    var coutTotal = 0;
    var cout = this.product.cout
    var quantite = this.product.quantite
    for(let i = 0; i < multiplier; i++) {
      quantite += 1 
      coutTotal += this.product.cout
      cout = cout*this.product.croissance
    }
    if (this._money - coutTotal > 0) {
      this.product.cout = cout
      this.product.quantite = quantite
      this.notifyBuy.emit(coutTotal)
      this.service.acheterQtProduit(this.product, multiplier).catch(reason =>
        console.log("erreur: " + reason));
    }
  }

  calculateBuy(multiplier: number) {
    return this.product.cout*multiplier;
  }

  @Output() notifyProduction: EventEmitter<Product> = new EventEmitter<Product>();
  @Output() notifyBuy: EventEmitter<number> = new EventEmitter<number>();
}


