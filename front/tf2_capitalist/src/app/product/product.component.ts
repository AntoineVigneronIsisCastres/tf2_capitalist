import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../world';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WebserviceService } from '../webservice.service';
import { Orientation } from '../progressbar.component';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent {
  product: Product = new Product;
  server = 'http://localhost:4000';
  progressbarvalue = 0;
  initialValue = 0;
  auto = false;
  run = false;
  frontcolor = '#BA3435';
  backcolor = 'blue';
  orientation = Orientation.horizontal;
  vitesse = 0;
  lastupdate = 0;
  _qtmulti = "";
  multiplier = 0;
  _money = 0;
  timedisplay = "00:00:00";
  constructor(private router: Router, private service: WebserviceService, private snackBar: MatSnackBar) { }
  @Input()
  set prod(value: Product) {
    this.product = value;
    // if (this.product && this.product.timeleft > 0) {
    //   this.lastupdate = Date.now();
    //   let progress = (this.product.vitesse - this.product.timeleft) / this.product.vitesse;7
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
    console.log("EN PREMIER"+this.product)
    console.log(this.product.timeleft)
    this.lastupdate = Date.now();
    setInterval(() => { this.calcScore(); }, 100)
  }

  startFabrication() {
    this.product.timeleft = this.product.vitesse;
    this.lastupdate = Date.now();
  }

  calcScore() {
    if (!(this.product.timeleft == 0) || (this.product.managerUnlocked == true && this.product.timeleft == 0)) {
      this.product.timeleft -= Date.now() - this.lastupdate
      console.log(this.product.timeleft)
      this.initialValue = this.product.vitesse - this.product.timeleft;
      console.log("INITIALVALUE : "+this.initialValue)
      this.lastupdate = Date.now()
      if (this.product.timeleft <= 0) {
        if (this.product.managerUnlocked == true) {
          this.startFabrication();
          this.auto = true;
          this.service.lancerProduction(this.product).catch(reason =>
            console.log("erreur: " + reason));
          this.notifyProduction.emit(this.product);
        } else {
          console.log("ici")
          this.product.timeleft = 0;
          this.progressbarvalue = 0;
          this.run = false;
          this.timedisplay = "00:00:00"
          this.service.lancerProduction(this.product).catch(reason =>
            console.log("erreur: " + reason));
          this.notifyProduction.emit(this.product);
        }
      } else {
        this.vitesse = this.product.vitesse;
        this.run = true;
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
      var ulpalliers = this.product.paliers.filter(palier => palier.unlocked === true)
      var lastpallier = ulpalliers[ulpalliers.length-1]
      if (!(typeof lastpallier === 'undefined') && ulpalliers.length < this.product.paliers.length) {
        var newpalier = this.product.paliers[ulpalliers.length]
        var newseuil = this.product.paliers[ulpalliers.length].seuil
        if (newseuil != 0 && this.product.quantite >= newseuil) {
          this.product.paliers.find(palier => palier.name == lastpallier.name)
          this.product.vitesse = newpalier ? this.product.vitesse/newpalier.ratio : this.product.vitesse
          newpalier.unlocked = true
          this.popMessage(this.product.name+" speed x"+newpalier.ratio+" ! ")
        }
      } else if (typeof lastpallier === 'undefined' && this.product.quantite >= this.product.paliers[0].seuil) {
        this.product.vitesse /= this.product.paliers[0].ratio
        this.product.paliers[0].unlocked = true;
        this.popMessage(this.product.name+" speed x"+this.product.paliers[0].ratio+" ! ")
      }
      this.notifyBuy.emit(coutTotal)
      this.service.acheterQtProduit(this.product, multiplier).catch(reason =>
        console.log("erreur: " + reason));
    }
  }

  calculateBuy(multiplier: number) {
    return this.product.cout*multiplier;
  }

  popMessage(message: string): void { this.snackBar.open(message, "", { duration: 2000 }) }

  @Output() notifyProduction: EventEmitter<Product> = new EventEmitter<Product>();
  @Output() notifyBuy: EventEmitter<number> = new EventEmitter<number>();
}


