import { Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WebserviceService } from './webservice.service';
import { Product, World } from './world';
import { ProductComponent } from './product/product.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('spinAnimation', [
      state('start', style({ transform: 'rotate(0deg)' })),
      state('end', style({ transform: 'rotate(360deg)' })),
      transition('start => end', animate('1s')),
    ])
  ]
})
export class AppComponent implements OnInit, OnDestroy{
  @ViewChildren(ProductComponent) 
  productsComponent: QueryList<ProductComponent> = new QueryList();
  title = 'tf2_capitalist';
  username = '';
  world: World = new World();
  multiplier = 'x1';
  showManagers = false;
  showAllUnlocks = false;
  showUnlocks = false;
  showCashUpgrades = false;
  showAngelUpgrades = false;
  showInvestors = false;
  angelstoclaim = 0;
  server = 'http://localhost:4000';
  profilepic = 'icones/redmond.png';
  titleicon = 'icones/tf2title.png';
  badgeManagers = 0;
  availableManagers = [];
  private timeouts: number[] = [];
  private spinDuration: number = 1000;
  constructor(private service: WebserviceService, private snackBar: MatSnackBar) {}


  ngOnInit() {
    var username = localStorage.getItem("username");
    if(username && username != '') {
      this.username = localStorage.getItem("username")!;
    } else {
      this.username = 'admin';
    }
    this.service.setUser(this.username);
    this.service.getWorld().then(
      world => {
        this.world = world.data.getWorld;
      });
      setTimeout(() => {this.triggerSpin()}, 1000);
      setInterval(() => { this.triggerSpin() }, 10000);
  }


  triggerSpin() {
    this.timeouts = []
    const spinDivs = document.querySelectorAll(".round") as NodeListOf<HTMLElement>;
    spinDivs.forEach((spinDiv: HTMLElement) => {
      const randomTimeout = Math.random() * 10000;
      const timeoutId = window.setTimeout(() => {
        this.startSpin(spinDiv);
      }, randomTimeout);
      this.timeouts.push(timeoutId);
    });
  }

  startSpin(spinDiv: HTMLElement) {
    spinDiv.style.animation = 'none';
    setTimeout(() => {
      spinDiv.style.animation = '';
    }, 0);
  }

  ngOnDestroy() {
    this.timeouts.forEach((timeoutId: number) => {
      window.clearTimeout(timeoutId);
    });
  }

  onProductionDone(data : {product: Product; qteProduit: number}) {
    const gain = data.product.quantite * data.product.revenu * data.qteProduit *
      (1 + (this.world.activeangels * this.world.angelbonus) / 100);
    this.world.money += gain;
    this.world.score += gain;
    this.angelstoclaim = Math.floor(150 * Math.sqrt(this.world.score / Math.pow(10, 15))) - this.world.totalangels;
    this.setBadgeManagers();
  }

  onBuy(coutTotal: number) {
    this.world.money -= coutTotal;

    this.world.allunlocks.forEach((allunlock) => {
    if (!allunlock.unlocked && 
      this.world.products.filter( (p) => p.quantite < allunlock.seuil).length == 0) {
        this.productsComponent.forEach((p) => { p.calcUpgrade(allunlock) });
        allunlock.unlocked = true;
      }
    });
  }

  setBadgeManagers() {
    this.badgeManagers = 0;
    for (var i = 0; i < this.world.managers.length; i++) {
      if (this.world.money >= this.world.managers[i].seuil){
        this.badgeManagers += 1;
      }
    }
  }

  changeMultiplier() {
    switch (this.multiplier) {
      case 'x1':
        this.multiplier = 'x10';
        break;
      case 'x10':
        this.multiplier = 'x100';
        break;
      case 'x100':
        this.multiplier = 'NEXT';
        break;
      case 'NEXT':
        this.multiplier = 'MAX';
        break;
      default:
        this.multiplier = 'x1';
        break;
    }
  }

  hireManager(manager: any) {
    if (this.world.money >= manager.seuil) {
      this.world.money -= manager.seuil;
      manager.unlocked = true;
      var product = this.world.products.find(product => product.id == manager.idcible)
      if (product) {
        product.managerUnlocked = true;
        this.popMessage("Manager "+manager.name+" hired !")
      }
      this.service.engagerManager(manager).catch(reason =>
        console.log("erreur: " + reason));
    }

  }

  buyUpgrade(upgrade: any) {
    if (this.world.money >= upgrade.seuil) {
      var product = this.world.products.find((p) => upgrade.idcible == p.id)!;
      var comp = this.productsComponent.find((comp) => comp.product.id == product.id);
      if (comp !== undefined) {
        comp.calcUpgrade(upgrade);
      }
      this.world.money -= upgrade.seuil;
      this.service.acheterCashUpgrade(upgrade).catch(reason =>
        console.log("erreur: " + reason));
    }
  }

  buyAngelUpgrade(angelupgrade: any) {
    if (this.world.activeangels >= angelupgrade.seuil) {
      this.world.activeangels -= angelupgrade.seuil;
      if (angelupgrade.idcible === 0) {
        this.productsComponent.forEach(p => p.calcUpgrade(angelupgrade));
      } else if (angelupgrade.idcible === -1 && angelupgrade.typeratio == 'ange') {
        this.world.angelbonus += angelupgrade.ratio;
      }
      this.service.acheterAngelUpgrade(angelupgrade).catch(reason =>
        console.log("erreur: " + reason));;
    }
  }

  resetWorld() {
    this.service.resetWorld().then(() => {
      window.location.reload();
    })
  }
  popMessage(message: string): void { this.snackBar.open(message, "", { duration: 2000 }) }

  onUsernameChanged(){
    localStorage.setItem("username", this.username ? this.username : 'admin')
    this.service.user = this.username;
    window.location.reload();
  }
}
