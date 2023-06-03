const fs = require('fs');
module.exports = {
    Query: {
        getWorld(parent, args, context) {
            saveWorld(context)
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
                    for(let i = 0; i < args.multiplier; i++) {
                        product.quantite += 1;
                        context.world.money -= product.cout;
                        console.log(context.world.money)
                        product.cout = product.cout*product.croissance;
                        console.log(product);
                        updateWorld(context);
                    }
                }
            } else {
                throw new Error(`Le produit avec l'id ${args.id} n'existe pas`);
            }
            saveWorld(context);
        },

        lancerProductionProduit(parent, args, context) {
            if(args.id) {
                var product = context.world.products.find(produit => args.id == produit.id);
                if(!product) {
                    throw new Error(`Le produit avec l'id ${args.id} n'existe pas`)
                } else {
                    product.timeleft = product.vitesse;
                    // context.world.lastupdate = Date.now();
                    console.log('----------------------------lancerproductionproduit-------------------')
                    updateWorld(context);
                }
            } else {
                throw new Error(`Le produit avec l'id ${args.id} n'existe pas`)
            }
            saveWorld(context)
        },

        engagerManager(parent, args, context) {
            console.log('----------------------------engagermanager-------------------')
            if(args.name) {
                var manager = context.world.managers.find(manager => args.name == manager.name);
                var product = context.world.products.find(product => manager.idcible == product.id);
                manager.unlocked = true;
                product.managerUnlocked = true;
                console.log(product);
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
        if(product.managerUnlocked) {
            console.log("TRUC")
            context.world.money += (tempsecoule/product.vitesse)*(product.quantite*product.revenu);
        } else {
            if(product.timeleft != 0 && product.timeleft < tempsecoule) {
                context.world.money += product.revenu*product.quantite;
                product.timeleft = 0;
            } else {
            }
            console.log("timeleft "+product.timeleft)
            console.log("managerunlocked "+product.managerUnlocked)
            console.log("tempsecoule "+tempsecoule)
            console.log("lastupdate "+context.world.lastupdate)
            console.log("nom "+product.name)
            console.log("revenu "+product.revenu)
            console.log("quantite "+product.quantite)
            console.log("money "+context.world.money)
        }
    }
    context.world.lastupdate = Date.now();
    saveWorld(context);
}

