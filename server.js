const express = require('express');
const express_graphql = require('express-graphql');
const { buildSchema } = require('graphql');
const bodyParser = require("body-parser");
const session = require("express-session");
const routes=require("./routes/route");
require("./TypeDefination");
var schema = buildSchema(`
    type Query {
        getProducts(productID:Int,onlyAvailableProducts:Boolean): [Product]
        viewCart: UserCart
    },
    type Mutation {
        addToCart(productID:Int!): Info
        completeCart: Info
    },
    type Product {
        productID: Int  
        title: String
        price: Float
        #inventory_count: Int     (Uncomment this line if  "getProducts2" is used.)
        in_stock: Boolean

    },
    type ProductInCart {
        productID:Int
        title: String
        qty:Int
        price:Float
    },
    type UserCart{
        Products:[ProductInCart]
        totalQty:Int
        totalPrice:Float
    },
    type Info{
        isSuccess:Boolean,
        message: String
    }
`);

let root = {
    getProducts :routes.getProducts,
    addToCart:routes.addToCart,
    viewCart: routes.viewCart,
    completeCart: routes.completeCart
};
// Create an express server and a GraphQL endpoint
let app = express();
const SESSION_SECRET = "secret";
app.use(
    session({
        name: "qid",
        //encrypt the cookie with the session secret
        secret: SESSION_SECRET,
        //if the session wasn't modified, don't save it again
        resave: false,
        //don't save sessions with nothing in them
        saveUninitialized: false,
        //cookie options
        cookie: {
            //cookie as only http-cookie, not normal cookie that can be accessed through javascript (document.cookie).
            httpOnly: true,
            // Send cookie only in https when in production mode.
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
        }
    })
);
app.use('/graphql', bodyParser.json(), (req, _, next) => {
    return next();
}, express_graphql(req => ({
    schema: schema,
    rootValue: root,
    graphiql: true,
    context: { req }
})));
app.listen(4000, () => console.log('Express GraphQL Server Now Running On localhost:4000/graphql'));