import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WebserviceService } from './webservice.service';
import { Product, World } from './world';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'tf2_capitalist';
  world: World = new World();
  multiplier = 'x1';
  showManagers = false;
  server = 'http://localhost:4000';
  badgeManagers = 0;
  availableManagers = [];
  constructor(private service: WebserviceService, private snackBar: MatSnackBar) {
    service.getWorld().then(
      world => {
        this.world = world.data.getWorld;
        this.world.products = world.data.getWorld.products;
      });
  }

  onProductionDone(p: Product) {
    this.world.money += p.revenu * p.quantite;
    this.world.score += p.revenu * p.quantite;
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
    if (this.world.money > manager.seuil) {
      this.world.money -= manager.seuil;
      manager.unlocked = true;
      var product = this.world.products.find(product => product.id == manager.idcible)
      if (product) {
        product.managerUnlocked = true;
        this.popMessage("Manager "+manager.name+" hired !")
      }
    }
  }

  popMessage(message: string): void { this.snackBar.open(message, "", { duration: 2000 }) }

}
