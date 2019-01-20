 /**
 * @typedef {Object} Info An object that indicates whether 'addToCart' and 'completeCart' operations where successful or not
 * @property {String} message  Success or error message
 * @property {Boolean} isSuccess True on successful operation, false otherwise.
 */

 /**
 * 
 * @typedef {Object} ProductInCart Represents a product in cart
 * @property {Number} productID   Product id of the product
 * @property {String} title       Title of the product
 * @property {Number} qty         Count of the product in the cart
 * @property {Number} price       Total cummalative price of the product
 */

 /**
 * 
 * @typedef {Object} UserCart  Represents the cart of a user
 * @property {[ProductInCart]} Products Products list
 * @property {Number} totalQty  Total number of products in the list
 * @property {Number} totalPrice Total price of the whole cart
 */

 /**
  * @typedef {Object} Product Represents a product in the Products table
  * @property {Number}  productID Product id of the product
  * @property {String} title Title of the product
  * @property {Number} price Price of the product
  * @property {Boolean} in_stock Whether the product is available or not
  */


