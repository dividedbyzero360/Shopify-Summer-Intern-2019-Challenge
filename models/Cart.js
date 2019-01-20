//The cart object
module.exports=function Cart(oldCart){
    this.products=oldCart.products || {};
    this.totalQty=oldCart.totalQty || 0;
    this.totalPrice=oldCart.totalPrice || 0;
    
    /**
     * Adds a product to the cart, also updates total quantity and total price of the cart.
     * @param {Product} item A product to be added to the cart
     * @param {Number} productID The product id of the Product
     */
    this.add=function(item,productID){
        //No such product in database
        if(!item){
            throw new Error("No such product with the product id "+productID);
        }
        let nameOfTheProduct=item.title;
        //If the product is out of stock
        if(item.inventory_count==0){
            throw new Error(`Sorry product ${nameOfTheProduct} is out of stock`);
        }
        var storedItem=this.products[productID];
        //If a product is added to the cart for the first time.
        if(!storedItem){
            storedItem=this.products[productID]={item:item,qty:0,price:0};
        }
        //If the product is already added to the cart "inventory_count" number of times.  
        if( storedItem.qty==item.inventory_count){
            //To stop a user from overloading his cart with the same product.
            // A user can only put as many product of a kind as available(inventory_count of the product)
            // The way Amazon does it.
            throw new Error(`Sorry can't add more ${nameOfTheProduct} to your cart. It has a limit of ${storedItem.qty} per user`);
             
        }
        storedItem.qty++;
        // Cummalative total of a single product(price of the product * number of times it is added to the cart )
        storedItem.price=storedItem.item.price*storedItem.qty;
        storedItem.price=parseFloat(storedItem.price.toFixed(2));
        //Total products in the cart.
        this.totalQty++;
        // Total price of the cart after a product is added.
        this.totalPrice+=storedItem.item.price;
        this.totalPrice=parseFloat(this.totalPrice.toFixed(2))
    }
    /**
     * Returns an UserCart object containing products list in the user's cart, along with total price and total quantity.
     * Each item in the products list contains information about the product and the count of that product in the cart
     *  and also the cummalative total of that product.
     * @returns {UserCart} UserCart
     */
    this.generateCartView=function(){
        var productsList=[];
        for(var productID in this.products){
            var storedItem=this.products[productID];
            var product={};
            product.productID=storedItem.item.productID;
            product.title=storedItem.item.title;
            //Same product quantity
            product.qty=storedItem.qty;
            //Same product total price
            product.price=storedItem.price;
            productsList.push(product);
        }
        var userCart={};
        userCart.Products=productsList;
        //Overall product quantity
        userCart.totalQty=this.totalQty;
        //Overall product total price
        userCart.totalPrice=this.totalPrice;
        return userCart;
    }

}

