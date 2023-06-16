const fs = require('fs');
module.exports = {
    Query: {
        getWorld(parent, args, context) {
            updateWorld(context)
            saveWorld(context)
            return context.world
        }
    },
    Mutation: {
        acheterQtProduit(parent, args, context) {
            updateWorld(context)
            if (args.id) {
                var quantite = args.quantite;
                var product = context.world.products.find(produit => args.id == produit.id);
                if (!product) {
                    throw new Error(`Le produit avec l'id ${args.id} n'existe pas`);
                } else {
                    var coutTotal = 0
                    for (let i = 0; i < args.multiplier; i++) {
                        product.quantite += 1;
                        coutTotal += product.cout;
                        product.cout = product.cout * product.croissance;
                    }
                    if (context.world.money - coutTotal > 0) {
                        product.paliers.forEach((p) => {
                            if (!p.unlocked && product.quantite >= p.seuil) {
                                calcUpgrade(p, product);
                            }});
                        context.world.allunlocks.forEach((allunlock) => {
                            console.log(allunlock)
                            console.log(context.world.products.filter((p) => p.quantite < allunlock.seuil))
                            if (!allunlock.unlocked && 
                              context.world.products.filter((p) => p.quantite < allunlock.seuil).length == 0) {
                                console.log("PPPPPPP"+p)
                                context.world.products.forEach((p) => { calcUpgrade(allunlock, p) });
                                allunlock.unlocked = true;
                              }
                            });
                        context.world.money -= coutTotal
                    }
                }
            } else {
                throw new Error(`Le produit avec l'id ${args.id} n'existe pas`);
            }
            saveWorld(context);
        },

        lancerProductionProduit(parent, args, context) {
            updateWorld(context)
            if (args.id) {
                var product = context.world.products.find(produit => args.id == produit.id);
                if (!product) {
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
        // calcNewUnlocks(world: World {
        //     return world.products.flatMap(p => p.paliers.filter(palier => !palier.unlmocked && palier.seuil <= p.quantite)).concat(world.allunlocks.filter(palier => !palier.unlocked && palier.seuil <= Math.min(...world.products.map(p => p.quantite))))
        // })
        engagerManager(parent, args, context) {
            console.log("money 1 "+context.world.money)
            updateWorld(context)
            console.log("money 2 "+context.world.money)
            console.log('----------------------------engagermanager-------------------')
            if (args.name) {
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
    var products = context.world.products;
    var tempsecoule = Date.now() - context.world.lastupdate;
    for (var product of products) {
        var quantite = calcQtProduitTempsEcoule(product, tempsecoule);
        const moneyMade =
            product.revenu *
            product.quantite *
            quantite
        context.world.money += moneyMade;
        context.world.score += moneyMade;
    }
    context.world.lastupdate = Date.now();
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
        if (product.timeleft < tempsEcoule) {
            nbrProduction = product.quantite;
            product.timeleft = 0;
        } else {
            product.timeleft -= tempsEcoule;
        }
    }
    return nbrProduction;
}

function calcUpgrade(palier, product) {
    // On ajoute l'unlock ou l'upgrade
    switch (palier.typeratio) {
      case "vitesse":
        product.vitesse /= palier.ratio;
        product.timeleft /= palier.ratio;
        break;
      case "gain":
        product.revenu *= palier.ratio;
        break;
      default:
        throw "Le type de ratio " + palier.typeratio + " n'existe pas !";
    }
    palier.unlocked = true;
  }
