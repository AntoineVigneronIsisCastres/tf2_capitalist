import { gql } from "@urql/core";
export const GET_WORLD = gql`
query GetWorld {
    getWorld {
      name
      logo
      money
      score
      totalangels
      activeangels
      angelbonus
      lastupdate
      products {
        id
        name
        logo
        cout
        croissance
        revenu
        vitesse
        quantite
        timeleft
        managerUnlocked
        paliers {
          name
          logo
          seuil
          idcible
          ratio
          typeratio
          unlocked
        }
      }
      allunlocks {
        name
        logo
        seuil
        idcible
        ratio
        typeratio
        unlocked
      }
      upgrades {
        name
        logo
        seuil
        idcible
        ratio
        typeratio
        unlocked
      }
      angelupgrades {
        name
        logo
        seuil
        idcible
        ratio
        typeratio
        unlocked
      }
      managers {
        name
        logo
        seuil
        idcible
        ratio
        typeratio
        unlocked
      }
    }
  }`;

  export const RESET_WORLD = gql`
  mutation resetWorld {
    resetWorld {
      name
    }
  }`;

export const LANCER_PRODUCTION = gql`
  mutation lancerProductionProduit($id: Int!) {
     lancerProductionProduit(id: $id) {
       id 
      } 
    }`

export const ENGAGER_MANAGER = gql`
    mutation engagerManager($name: String!) {
       engagerManager(name: $name) {
         name
        } 
      }`

export const ACHETER_CASH_UPGRADE = gql`
    mutation acheterCashUpgrade($name: String!) {
       acheterCashUpgrade(name: $name) {
         name
        } 
      }`

export const ACHETER_ANGEL_UPGRADE = gql`
    mutation acheterAngelUpgrade($name: String!) {
        acheterAngelUpgrade(name: $name) {
          name
        } 
      }`

export const ACHETER_QT_PRODUIT = gql`
    mutation acheterQtProduit($id: Int!, $quantite: Int!, $multiplier: Int!) {
       acheterQtProduit(id: $id, quantite: $quantite, multiplier: $multiplier) {
         id,
         quantite
        } 
      }`