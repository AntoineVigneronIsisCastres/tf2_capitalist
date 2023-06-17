import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Palier, Product } from '../world';
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
  barmask = 'icones/medichud.png'
  progressbarvalue = 0;
  initialValue = 0;
  auto = false;
  run = false;
  frontcolor = '#BA3435';
  backcolor = 'blue';
  orientation = Orientation.horizontal;
  vitesse = 0;
  lastupdate = Date.now();
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
    setInterval(() => { this.calcScore(); }, 100)
    if(this.product.managerUnlocked || this.product.timeleft != 0){
      this.initialValue = this.product.vitesse - this.product.timeleft;
    }
  }

  lancerProduction() {
    if (!this.product.managerUnlocked) {
      this.product.timeleft = this.product.vitesse;
      this.service
        .lancerProduction(this.product)
        .catch((reason) => console.log('erreur: ' + reason));
    }
  }

  calcScore() {
    if (this.product.timeleft <= 0 && !this.product.managerUnlocked) {
      this.run = false;
      this.initialValue = 0;
      this.lastupdate = Date.now();
      return;
    }
    this.run = true;
    var elapsedTime = Date.now() - this.lastupdate;
    var qteProduit = this.calcQtProductionforElapseTime(elapsedTime);
    if (qteProduit > 0) {
      this.notifyProduction.emit({ product: this.product, qteProduit });
    }
    this.timedisplay = this.convertToTime(this.product.timeleft);
    this.lastupdate = Date.now();
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
      this.product.paliers.forEach((p) => {
        if (!p.unlocked && this.product.quantite >= p.seuil) {
          this.calcUpgrade(p);
        }
      });
      this.notifyBuy.emit(coutTotal)
      this.service.acheterQtProduit(this.product, multiplier).catch(reason =>
        console.log("erreur: " + reason));
    }
  }

  calculateBuy(multiplier: number) {
    return this.product.cout*multiplier;
  }

  calcQtProductionforElapseTime(tempsEcoule: number) {
    let nbrProduction = 0;
    if (this.product.managerUnlocked) {
      this.auto = true;
      this.run = true;
      this.vitesse = this.product.vitesse;

      if (tempsEcoule > this.product.timeleft) {
        var nbr = Math.trunc(
          (tempsEcoule - this.product.timeleft) / this.product.vitesse
        );
        if(this.product.timeleft != 0) {
          nbrProduction = nbr + 1;
        } else {
          nbrProduction = 0;
        }
        this.product.timeleft =
          this.product.vitesse -
          (tempsEcoule - this.product.timeleft - this.product.vitesse * nbr);
      } else {
        this.product.timeleft = this.product.timeleft - tempsEcoule;
      }
    } else if (this.product.timeleft != 0) {
      // this.initialValue = this.product.vitesse - this.product.timeleft;
      this.vitesse = this.product.vitesse;
      if (this.product.timeleft < tempsEcoule) {
        nbrProduction = this.product.quantite;
        this.product.timeleft = 0;
        // this.run = false;
      } else {
        this.product.timeleft -= tempsEcoule;
      }
    }
    return nbrProduction;
  }

  calcUpgrade(p: Palier) {
    if (!p.unlocked || p.idcible === 0) {
      let customMessage = '';
      switch (p.typeratio) {
        case 'vitesse':
          this.product.vitesse /= p.ratio;
          this.product.timeleft /= p.ratio;
          customMessage = 'speed increased x' + p.ratio + ' !';
          break;
        case 'gain':
          this.product.revenu *= p.ratio;
          customMessage = 'income increased x' + p.ratio + ' !';
          break;
        default:
          throw 'Le type de ratio ' + p.typeratio + " n'existe pas !";
      }
      p.unlocked = true;
      this.popMessage(
        `Product ${this.product.name} ${customMessage}`);
    }
  }

  popMessage(message: string): void { this.snackBar.open(message, "", { duration: 2000 }) }

  @Output() notifyProduction = new EventEmitter();
  @Output() notifyBuy: EventEmitter<number> = new EventEmitter<number>();
}


