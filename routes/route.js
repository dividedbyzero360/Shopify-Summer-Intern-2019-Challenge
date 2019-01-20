const productsDatabase = require("../models/Products");
const Cart = require("../models/Cart");
const util = require("../Util/Util");
/**
 *Adds an available product (inventory_count > 0) to the cart. If an user attempts to add an out of stock product,
 *tries to add a product more than what is available or if the product id is invalid,  then gets an error message
 *else a success message.
 * @param {Object} data An object containing the product id of the product the user wants to add to the cart. Example {productID:1}
 * @param {Number} data.productID   The product id of the product the user wants to add to the cart.
 * @param {Object} req The request object, sent internally by express. Use to track user session 
 * @returns {Info}  Returns an Object of type {isSuccess:Boolean,message:String}
 */
let addToCart = function ({ productID }, { req }) {
    var product = productsDatabase.getProducts({ productID })[0];
    let cart = new Cart(req.session.cart ? req.session.cart : {});
    try {
        //Adds product to the cart.
        //Throws error if the product is out of stock
        //or product id is invalid.
        cart.add(product, productID);
    }
    catch (err) {
        return { isSuccess: false, message: err.message }
    }
    //The first time a user successfully enters a product to his cart
    //a session is created for that user to keep track of his cart.
    req.session.cart = cart;
    return { isSuccess: true, message: `Product ${product.title} successfully added to cart` };
}


/**
 * Returns an UserCart object containing products list in the user's cart, along with total price and total quantity.
 * Each item in the products list contains information about the product and the count of that product in the cart and
 * also the cummalative total of the product. The method will also remove a product completely if it is out of stock 
 * or remove some quantity of it depending on the inventory_count of the product.       
 * @param {*} _  Empty object that gets sent with graphql requests. Ignored in this case
 * @param {Object} req The request object, sent internally by express. Use to track user session  
 * @returns {UserCart} UserCart
 */
let viewCart = function (_, { req }) {
    //If a user has atleast one product in his cart.
    if(req.session.cart){
        try{
            //Make neccessary changes to the cart according to the availability of the products.
            util.verifyCart(req.session.cart);
        }catch(err){

        }
    }
    let cart = new Cart(req.session.cart ? req.session.cart : {});
    return cart.generateCartView();
}
/**
 * Depending on situation this method does either of the 2 things (When the user has atleast one product in the cart)
 * 1. Decrease the inventory_count of the products present in the user's cart and charges the user.
 * 2. Like viewCart, will remove the products from the cart if not available. 
 * In both the cases it returns the Info Object to notify the user. 
 * @param {*} _ Empty object that gets sent with graphql requests. Ignored in this case
 * @param {Object} req The request object, sent internally by express. Use to track user session
 * @returns {Info} Info
 */
let completeCart = function (_, { req }) {
    if (req.session.cart && req.session.cart.totalQty!=0) {
        try {
            //Make neccessary changes to the cart according to the availability of the products.
            util.verifyCart(req.session.cart);
        } catch (err) {
            //One or more product in the cart is either out of stock or is present in the cart in more quantity
            //than what is available in the stock. It lets the user know before billing him/her.
            return { isSuccess: false, message: err.message }
        }
        //Decrease the inventory_count of the products present in the user's cart.
        productsDatabase.decreaseInventoryCountOfProducts(req.session.cart);
        let tempCart=req.session.cart;
        //Successfully checkouts. User's cart is not tracked any more now. 
        //Until she/he put products in his cart again. 
        req.session.cart = null;
        return { isSuccess: true, message: `You are billed $${tempCart.totalPrice}. Thank you for shopping with us.` };
    }
    // When a user has no product in his cart.
    else {
        return { isSuccess: false, message: "Please add a product to your cart before purchasing" };
    }
}


/**
 * The method takes an Object with two optional properties.
 * 1. productID ->In case when the user wants the detail of a single product. When "productID" is present
 * "onlyAvailableProducts" has no effect.
 * 2. onlyAvailableProducts->In case when the user want the details of only products currently in stock.
 * 3. If no property is set all products whether in stock or not are sent.
 * @param {Object} data  Object with optional properties of type {productID: Number, onlyAvailableProducts: Boolean}
 * @param {Number} data.productID Optional productID
 * @param {Boolean} data.onlyAvailableProducts  Optional onlyAvailableProducts
 * @param {Object} req The request object, sent internally by express. Use to track user session
 * @returns {[Product]} Returns an array of Product
 */
let getProducts = function ({ productID, onlyAvailableProducts }, { req }) {
    let products = productsDatabase.getProducts({ productID, onlyAvailableProducts });
    return products;
}

//Dead code
//Was initially used to update the inventory_count of a product for the user's view(not real database) 
//after the user adds the product in the cart. 
//Unneccessarily expensive as it involve copying the "Product" table.
let getProducts2 = function ({ productID, onlyAvailableProducts }, { req }) {
    let products = productsDatabase.getProducts({ productID, onlyAvailableProducts });
    if (req.session.cart != undefined) {
        return util.changeInventoryCountForTheUser(products, req.session.cart);
    }
    return products;
}


let routes={addToCart,viewCart,completeCart, getProducts};
module.exports=routes;