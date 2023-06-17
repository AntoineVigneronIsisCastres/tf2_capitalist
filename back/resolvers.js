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
                            if (!allunlock.unlocked && 
                              context.world.products.filter((p) => p.quantite < allunlock.seuil).length == 0) {
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
                }
            } else {
                throw new Error(`Le produit avec l'id ${args.id} n'existe pas`)
            }
            saveWorld(context)
        },
        engagerManager(parent, args, context) {
            updateWorld(context)
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
        },
        acheterCashUpgrade(parent, args, context) {
            updateWorld(context)
            if(args.name) {
                var cashupgrade = context.world.upgrades.find(u => u.name == args.name);
                var product = context.world.products.find(p => p.id == cashupgrade.idcible);
                cashupgrade.unlocked = true;
                context.world.money -= cashupgrade.seuil;
                calcUpgrade(cashupgrade, product);
            } else {
                throw new Error(`Le cash upgrade avec le nom ${args.name} n'existe pas`)
            }
            saveWorld(context);
        },
        acheterAngelUpgrade(parent, args, context) {
            updateWorld(context)
            if(args.name) {
                var angelupgrade = context.world.angelupgrades.find(a => a.name == args.name)
                if(angelupgrade) {
                    context.world.activeangels -= angelupgrade.seuil;
                    if (angelupgrade.idcible === 0) {
                        context.world.products.forEach(p => calcUpgrade(angelupgrade, p));
                    } else if (angelupgrade.idcible === -1 && upgrades.typeratio === 'angel') {
                        context.world.angelbonus += angelupgrade.ratio;
                    }
                } else {
                    throw new Error (`L'angelupgrade avec le nom ${args.name} n'existe pas`)
                }
            } else {
                throw new Error(`L'angelupgrade avec le nom ${args.name} n'existe pas`)
            }
            saveWorld(context);
        },
        resetWorld(parent, args, context) {
            updateWorld(context);
            var angelstoclaim = Math.floor(150 * Math.sqrt(context.world.score / Math.pow(10, 15))) -
            context.world.totalangels;
            var score = context.world.score
            var activeangels = angelstoclaim + context.world.activeangels;
            var totalangels = angelstoclaim + context.world.totalangels;
            context.world = {
                ...world,
                score: score,
                totalangels: totalangels,
                activeangels: activeangels,
            };
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
        const gain = product.revenu * product.quantite * quantite *
            (1 + (context.world.activeangels * context.world.angelbonus) / 100);
        context.world.money += gain;
        context.world.score += gain;
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
