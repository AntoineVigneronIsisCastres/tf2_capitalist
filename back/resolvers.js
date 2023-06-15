const fs = require('fs');
module.exports = {
    Query: {
        getWorld(parent, args, context) {
            console.log("AVANT GET"+context.world.money)
            updateWorld(context)
            console.log("APRES GET"+context.world.money)
            saveWorld(context)
            return context.world
        }
    },
    Mutation: {
        acheterQtProduit(parent, args, context){
            updateWorld(context)
            if(args.id) {
                var quantite = args.quantite;
                var product = context.world.products.find(produit => args.id == produit.id);
                if(!product) {
                    throw new Error(`Le produit avec l'id ${args.id} n'existe pas`);
                } else {
                    var coutTotal = 0
                    for(let i = 0; i < args.multiplier; i++) {
                        product.quantite += 1;
                        coutTotal += product.cout;
                        product.cout = product.cout*product.croissance;
                        //todo : ajouter la soustraction totale à context world money
                    }
                    if (context.world.money - coutTotal > 0) {
                        var ulpalliers = product.paliers.filter(palier => palier.unlocked === true)
                        var lastpallier = ulpalliers[ulpalliers.length-1]
                        if (!(typeof lastpallier === 'undefined') && ulpalliers.length < product.paliers.length) {
                          var newpalier = product.paliers[ulpalliers.length]
                          var newseuil = product.paliers[ulpalliers.length].seuil
                          if (newseuil != 0 && product.quantite >= newseuil) {
                            product.paliers.find(palier => palier.name == lastpallier.name)
                            product.vitesse = newpalier ? product.vitesse/newpalier.ratio : product.vitesse
                            newpalier.unlocked = true
                            this.popMessage(product.name+" speed x"+newpalier.ratio+" ! ")
                          }
                        } else if (typeof lastpallier === 'undefined' && product.quantite >= product.paliers[0].seuil) {
                          product.vitesse /= product.paliers[0].ratio
                          product.paliers[0].unlocked = true;
                          this.popMessage(product.name+" speed x"+product.paliers[0].ratio+" ! ")
                        }
                        console.log(coutTotal)
                        context.world.money -= coutTotal
                      }
                }
            } else {
                throw new Error(`Le produit avec l'id ${args.id} n'existe pas`);
            }
            saveWorld(context);
        },

        lancerProductionProduit(parent, args, context) {
            console.log("PRODUCTVITESSE"+product.vitesse)
            console.log("coekcoecoekf")
            updateWorld(context)
            if(args.id) {
                var product = context.world.products.find(produit => args.id == produit.id);
                if(!product) {
                    throw new Error(`Le produit avec l'id ${args.id} n'existe pas`)
                } else {
                    product.timeleft = product.vitesse;
                    console.log('----------------------------lancerproductionproduit-------------------')
                }
            } else {
                throw new Error(`Le produit avec l'id ${args.id} n'existe pas`)
            }
            saveWorld(context)
        },

        engagerManager(parent, args, context) {
            updateWorld(context)
            console.log('----------------------------engagermanager-------------------')
            if(args.name) {
                var manager = context.world.managers.find(manager => args.name == manager.name);
                var product = context.world.products.find(product => manager.idcible == product.id);
                manager.unlocked = true;
                product.managerUnlocked = true;
                context.world.money -= manager.seuil;
                product.timeleft = product.vitesse;
            } else {
                throw new Error(`Le manager avec le nom ${args.name} n'existe pas`)
            }
            saveWorld(context);
        }
    }
};

function saveWorld(context) {
    fs.writeFile("userworlds/" + context.user + "-world.json", JSON.stringify(context.world),
        err => {
            if (err) {
                console.error(err);
                throw new Error(`Erreur d'écriture du monde coté serveur`);
            }
        })
}

function updateWorld(context) {
    console.log("UPDATE")
    var products = context.world.products;
    var tempsecoule = Date.now() - context.world.lastupdate;
    for(var product of products) {
        var quantite = calcQtProduitTempsEcoule(product, tempsecoule);
        context.world.money += product.revenu * quantite;
    }
    context.world.lastupdate = Date.now();
    console.log(context.world.money)
    // saveWorld(context);
}

function calcQtProduitTempsEcoule(product, tempsEcoule) {
    let nbrProduction = 0;
    if (product.managerUnlocked) {
      if (tempsEcoule - product.timeleft > 0) {
        var nbr = Math.trunc((tempsEcoule - product.timeleft) / product.vitesse);
        nbrProduction = nbr + 1;
        product.timeleft = product.vitesse - (tempsEcoule - product.timeleft - product.vitesse * nbr);
      } else {
        product.timeleft = product.timeleft - tempsEcoule;
      }
    } else if (product.timeleft != 0) {
        console.log("test")
      if (product.timeleft < tempsEcoule) {
        nbrProduction = product.quantite;
        product.timeleft = 0;
      } else {
        product.timeleft -= tempsEcoule;
      }
    }
    return nbrProduction;
  }
