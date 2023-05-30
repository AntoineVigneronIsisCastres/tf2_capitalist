const fs = require('fs');
module.exports = {
    Query: {
        getWorld(parent, args, context) {
            saveWorld(context);
            return context.world
        }
    },
    Mutation: {
        acheterQtProduit(parent, args, context){
            if(args.id) {
                var quantite = args.quantite;
                var product = context.world.products.find(produit => args.id == produit.id);
                if(!product) {
                    throw new Error(`Le produit avec l'id ${args.id} n'existe pas`);
                } else {
                    product.quantite += quantite;
                    context.world.money -= product.cout;
                    product.cout = product.cout*product.croissance;
                    updateWorld(context);
                }
            } else {
                throw new Error(`Le produit avec l'id ${args.id} n'existe pas`);
            }
        },

        lancerProductionProduit(parent, args, context) {
            if(args.id) {
                var product = context.world.products.find(produit => args.id == produit.id);
                if(!product) {
                    throw new Error(`Le produit avec l'id ${args.id} n'existe pas`)
                } else {
                    product.timeleft = product.vitesse;
                    context.world.lastupdate = Date.now();
                    updateWorld(context);
                }
            } else {
                throw new Error(`Le produit avec l'id ${args.id} n'existe pas`)
            }
        },

        engagerManager(parent, args, context) {
            if(args.name) {
                var manager = context.world.managers.find(manager => args.name == manager.name);
                var product = context.world.products.find(product => manager.idcible == product.id);
                manager.unlocked = true;
                product.managerUnlocked = true;
                saveWorld(context);
            } else {
                throw new Error(`Le manager avec le nom ${args.name} n'existe pas`)
            }
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
    for(var product of products) {
        if(product.quantite >=1) {
            var tempsecoule = Date.now() - context.world.lastupdate;
            if(product.managerUnlocked) {
                context.world.money += (tempsecoule/product.vitesse)*(product.quantite*product.revenu);
            } else {
                if(product.timeleft != 0 && product.timeleft < tempsecoule) {
                    context.world.money += product.revenu*product.quantite;
                } else {
                    product.timeleft -= tempsecoule;
                }
            }
        }
    }
    context.world.lastupdate = Date.now();
    saveWorld(context);
}

