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
  products: Product[] = [];
  constructor(private service: WebserviceService) {
    service.getWorld().then(
      world => {
        this.world = world.data.getWorld;
        this.products = world.data.getWorld.products;
      });
  }

}
