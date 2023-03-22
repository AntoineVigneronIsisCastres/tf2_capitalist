import { Component } from '@angular/core';
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
  server = 'http://localhost:4000'
  constructor(private service: WebserviceService) {
    service.getWorld().then(
      world => {
        this.world = world.data.getWorld;
        this.world.products = world.data.getWorld.products;
      });
  }

  onProductionDone(p: Product){
    this.world.money += p.revenu*p.quantite;
    this.world.score += p.revenu*p.quantite;
  }

  changeMultiplier(){
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
    return null;
  }

}
