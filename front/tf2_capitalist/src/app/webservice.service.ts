import { Injectable } from '@angular/core';
import { createClient } from '@urql/core';
import { AppComponent } from './app.component';
import { ACHETER_QT_PRODUIT, ENGAGER_MANAGER, GET_WORLD } from './graphrequests';
import { LANCER_PRODUCTION } from './graphrequests';
import { Product } from './world';
@Injectable({
  providedIn: 'root'
})
export class WebserviceService {

  server = 'http://localhost:4000';
  user = '';
  createClient() {
    return createClient({
      url: this.server + "/graphql", fetchOptions: () => {
        return {
          headers: { 'x-user': this.user },
        };
      },
    });
  }
  getWorld() {
    return this.createClient().query(GET_WORLD, {}).toPromise();
  }

  getUser() {
    return this.user;
  }

  setUser(user: string) {
    this.user = user;
  }

  lancerProduction(product: Product) {
    return this.createClient().mutation(LANCER_PRODUCTION, {
      id:
        product.id
    }).toPromise();
  }

  engagerManager(manager: any) {
    return this.createClient().mutation(ENGAGER_MANAGER, {
      name:
        manager.name
    }).toPromise();
  }

  acheterQtProduit(product: Product, multiplier: number) {
    return this.createClient().mutation(ACHETER_QT_PRODUIT, {
      id:
        product.id,
      quantite:
        product.quantite,
      multiplier:
        multiplier
    }).toPromise();
  }
  constructor() { }
}

