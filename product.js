// Pour une documentation complète sur API, incluant des exemples de code, allez sur http://wix.to/94BuAAs
import wixData from 'wix-data';
import wixUsers from 'wix-users';
/**
 * Created By Majdi ZOUARI on 30/04/2020
 */
let productId; 
let product; 
let newReview;
let newRate;
let user;
let userFullName;

// Traitement pendant le chargement de la page
$w.onReady(async function () {
        $w('#reviewText').maxLength = 400;
        $w('#generalRatings').hide();
        $w('#connectText').hide();
        $w('#ratingOK').hide();
        hideRatingKOMessage();
        $w('#ratingError').hide();
        $w('#ratingGroup').show();
        checkMemberConnected();
        product = await $w('#productPage1').getProduct(); 
        productId = product._id;
        loadStatistics();
});

// Enregistrement de la note de l'utilisateur connecté
export function addReview_click(event) {
        // L'utilisateur a saisi une note
        if( $w('#ratingInput').value !== undefined ){

                newRate= $w('#ratingInput').value
                newReview = {
                        title: $w('#reviewText').value,
                        rating: $w('#ratingInput').value,
                        produit: productId,
                        name: userFullName
                };

                wixData.save("Reviews", newReview)
                .then( (results) => {
                        let item = results;
                        $w('#reviewText').value = '';
                        $w("#ratingInput").value= undefined;
                        $w("#ratingInput").resetValidityIndication();
                        $w('#SubmitReviews').refresh();
                        $w("#ratingGroup").hide();
                        $w("#ratingOK").show();
                        
                        // MAJ de la note globale du produit
                        updateStatistics();
                } )
                .catch( (err) => {
                        console.log('errMsg : ' , err.message); 
                        console.log('errCode : ' , err.code);
                        $w("#ratingError").show();
                } );
        
        }
        // L'utilisateur n'a pas saisi une note
        else {
                showRatingKOMessage();
        }
       
}

// MAJ de la note globale du produit
export function updateStatistics() {
        let prodcutStats;
        wixData.get("Reviews-stats", productId)
        .then( (results) => {
                let item = results;
                prodcutStats = item;
                // Le produit est déjà noté
                if (prodcutStats !== undefined && prodcutStats !== null) {
                        prodcutStats.rating += newRate; 
                        prodcutStats.count += 1; 

                        //MAJ  de sa note globale
                        wixData.update("Reviews-stats", prodcutStats)
                        .then( (elements) => {
                                loadStatistics();
                        } )
                        .catch( (err) => {
                                console.log('errMsg : ' , err.message); 
                                console.log('errCode : ' , err.code);
                        } );
                // Le produit n'est pas noté
                } else {
                        prodcutStats = {
                                _id: productId,
                                title: product.name,
                                rating: newRate,
                                count: 1
                        };

                        wixData.save("Reviews-stats", prodcutStats)
                        .then( (elements) => {
                                loadStatistics();
                        } )
                        .catch( (err) => {
                                console.log('errMsg : ' , err.message); 
                                console.log('errCode : ' , err.code);
                        } );  
                } 
        } )
        .catch( (err) => {
                console.log('errMsg : ' , err.message); 
                console.log('errCode : ' , err.code);
        } );
             
}

// Charger les reviews et notes du produit
export function loadStatistics() {
        // Afficher les reviews du produit séléctionné
        $w('#SubmitReviews').setFilter(wixData.filter().eq('produit', product._id));
        let stats;
        wixData.get("Reviews-stats", productId)
        .then( (results) => {
                stats = results; 
                // Le produit est déjà noté
                if (stats!==undefined && stats !==null ) { 
                        let avgRating = (Math.round(stats.rating * 10 / stats.count) / 10); 
                        $w('#generalRatings').rating = avgRating;
                        $w('#generalRatings').numRatings = stats.count;
                        $w('#generalRatings').show(); 
                // Le produit n'est pas noté
                } else {
                        $w('#generalRatings').show(); 
                        $w('#generalRatings').rating = 0;
                        $w('#generalRatings').numRatings = 0;
                }
        } )
        .catch( (err) => {
        let errMsg = err.message;
                console.log('errMsg : ' , err.message); 
                console.log('errCode : ' , err.code);
        } );
}

// Traitement suite à la notation du produit
export function ratingInput_click(event) {
        $w("#ratingKOText").hide();
        $w("#ratingKOFinger").hide();         
}

// Cacher les messages d'erreur 
export function hideRatingKOMessage() {
        $w("#ratingKOText").hide();
        $w("#ratingKOFinger").hide();
}

// Afficher les messages d'erreur 
export function showRatingKOMessage() {
        $w("#ratingKOText").show();
        $w("#ratingKOFinger").show();
}

// Connexion obligatoire pour noter un produit
export function checkMemberConnected(){
        user = wixUsers.currentUser;
        if(user.loggedIn){
            getUserFullName(user.id);
        } else {
            $w('#addReview').disable();
            $w('#connectText').show();
        }
}

// Récupèrer le nom complet de l'utilisateur connecté
export function getUserFullName(userId){
        wixData.get("Members/PrivateMembersData", userId)
        .then( (results) => {
                userFullName = results.name;
        } )
        .catch( (err) => {
                console.log('errMsg : ' , err.message); 
                console.log('errCode : ' , err.code);
        } );
}