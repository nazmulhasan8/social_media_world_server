const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;

const app = express();

// middleware all
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.v3wd6au.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}


async function run() {
    try {
       

        const categoriesCollection = client.db('socialMedia').collection('categories');
        const bookingsProductCollection = client.db('socialMedia').collection('bookingsProduct');
        const usersCollection = client.db('socialMedia').collection('users');
        const paymentsCollection = client.db('socialMedia').collection('payments');
        const allProductsCollection = client.db('socialMedia').collection('allProducts');
        const advertiseCollection = client.db('socialMedia').collection('advertise');
        const reporttoadminCollection = client.db('socialMedia').collection('reporttoadmin');

       




        app.patch('/users/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const verified = req.body.verified;
            // console.log(id);
            // console.log(verified);
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };

            const updatedDoc = {
                $set:{
                    verified: verified
                }
            }
            const result = await usersCollection.updateOne(query, updatedDoc, options);
            res.send(result);
        })



        // reporttoadmin

        app.get('/reporttoadmin', async (req, res) => {
            const query = {}
            const cursor = reporttoadminCollection.find(query);
            const reporttoadminAll = await cursor.toArray();
            res.send(reporttoadminAll);
        });

        app.get('/reporttoadmin/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { _id: ObjectId(id) };
                    
            // console.log(query);
            const products2 = await reporttoadminCollection.find(query).toArray();
            // console.log(products2);
            res.send(products2);          
        });

        app.post('/reporttoadmin', verifyJWT, async (req, res) => {
            const product = req.body;
            const result = await reporttoadminCollection.insertOne(product);
            res.send(result);
        });

        app.delete('/reporttoadmin/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const filter = { _id: ObjectId(id) };
            const result = await reporttoadminCollection.deleteOne(filter);
            res.send(result);
        })

        

        // advertise

        app.get('/advertise', async (req, res) => {
            const query = {}
            const cursor = advertiseCollection.find(query);
            const advertiseAll = await cursor.toArray();
            res.send(advertiseAll);
        });

        app.get('/advertise/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { _id: ObjectId(id) };
                    
            // console.log(query);
            const products2 = await advertiseCollection.find(query).toArray();
            // console.log(products2);
            res.send(products2);          
        });

        app.delete('/advertise/:id', verifyJWT, async (req, res) => {
            
            // const payment = req.body;
            
            // const id = payment.productId
            // const filter = {productId: id}

            // const id = req.params.id;
            // const status = req.body.status
            // const query = { _id: ObjectId(id) }

            
            const id = req.params.id;
            // console.log(id);
            const query = { productId: id };
          
            const result = await advertiseCollection.deleteOne(query);
            res.send(result);
        })

        // const payment = req.body;
        //     
        //     const id = payment.productId
        //     const filter = {productId: id}

        app.post('/advertise', verifyJWT, async (req, res) => {
            


            const booking = req.body;
            // console.log(booking);
            const query = {
                // email: booking.email,
                title: booking.title
            }

            const alreadyBooked = await advertiseCollection.find(query).toArray();

            if (alreadyBooked.length) {
                const message = `Sorry!! ${booking.title} Have Already Advertised. You can't do it twice. `
                return res.send({ acknowledged: false, message })
            }

            const result = await advertiseCollection.insertOne(booking);
            res.send(result);



        });

        // allPosts

        app.get('/allProducts/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { categoryName: id };
                    
            // console.log(query);
            const products = await allProductsCollection.find(query).sort({postedTime : -1}).toArray();
            // console.log(products);
            res.send(products);          
        });


        // allPosts4

        app.get('/allProducts4', async (req, res) => {
            
            const query = { };
                    
            // console.log(query);
            const products = await allProductsCollection.find(query).sort({postedTime : -1}).toArray();
            // console.log(products);
            res.send(products);          
        });


          // allPosts3

          app.get('/allPosts3', async (req, res) => {
            const id = 'SAMSUNG';
            // console.log(id);
            const query = { categoryName: id };
                    
            // console.log(query);
            const products = await allProductsCollection.find(query).sort({likeValue : -1}).limit(3).toArray();
            // console.log(products);
            res.send(products);          
        });


        



        app.get('/allProducts2/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { _id: ObjectId(id) };
                    
            // console.log(query);
            const products = await allProductsCollection.findOne(query);
            // console.log(products);
            res.send(products);          
        });


        app.post('/allProducts', verifyJWT, async (req, res) => {
            const product = req.body;
            const result = await allProductsCollection.insertOne(product);
            res.send(result);
        });

        app.delete('/allProducts/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const filter = {  _id: ObjectId(id) };
            const filter2 = { _id: id };
            const result = await allProductsCollection.deleteOne(filter);
            const result2 = await advertiseCollection.deleteOne(filter2);
            // console.log(result2 );
            res.send(result);
        })

        // manage products
        app.get('/allProducts', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' });
            }

            const query = { sellerEmail: email };
            const result = await allProductsCollection.find(query).toArray();
            res.send(result);
           
        })

  // searchResult

app.get('/searchResult', async (req, res) => {
    const value = req.query.value;
    
    const query = { title: value };
    console.log(query);
    const result = await allProductsCollection.findOne(query);
    res.send(result);



    console.log(result);
   
})
       
       
        // payment
        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body;
            const price = booking.resalePrice;
            const amount = price * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ]
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        app.post('/payments', async (req, res) =>{
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment);
            const id = payment.productId
            const filter = {productId: id}
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatedResult = await bookingsProductCollection.updateOne(filter, updatedDoc)
            const updatedResult2 = await advertiseCollection.updateOne(filter, updatedDoc)
           
            const updatedResult3 = await allProductsCollection.updateOne(filter, updatedDoc)


            res.send(result);
        })



        // jwt
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '30d' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        });


        // users
        app.post('/users', async (req, res) => {
            const user = req.body;
            // console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        // bookingsProduct




        app.get('/bookingsProduct', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' });
            }

            const query = { buyerEmail: email };
            const bookings = await bookingsProductCollection.find(query).toArray();
            res.send(bookings);
        });

        

        app.get('/bookingsProductForSeller', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' });
            }

            const query = { buyerEmail: email };
            const bookings = await bookingsProductCollection.find(query).toArray();
            res.send(bookings);
        });

        app.get('/bookingsProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const booking = await bookingsProductCollection.findOne(query);
            res.send(booking);
        })

        //New Post
        app.get('/bookingsProduct2/:id', async (req, res) => {
            const id = req.params.id;
            const query = { mongobdProductId: id };
            const booking = await bookingsProductCollection.find(query).toArray();
            res.send(booking);
        })

      


        app.post('/bookingsProduct', async (req, res) => {
            const booking = req.body;
            // console.log(booking);
            const query = {
                // email: booking.email,
                title: booking.title
            }

            const alreadyBooked = await bookingsProductCollection.find(query).toArray();

            if (alreadyBooked.length) {
                const message = `Sorry!! ${booking.title} is Sold Out`
                return res.send({ acknowledged: false, message })
            }

            const result = await bookingsProductCollection.insertOne(booking);
            res.send(result);
        });

//new post
        app.post('/bookingsProduct2', async (req, res) => {
            const booking = req.body;
            // console.log(booking);
          

            const result = await bookingsProductCollection.insertOne(booking);
            res.send(result);
        });

// new post update

        app.patch('/orders4/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body.status
            const query = { _id: ObjectId(id) }
            // console.log(id);
            const updatedDoc = {
                $set:{
                    likeValue: status
                }
            }


            // console.log(query);
            // console.log(status);

            const result = await allProductsCollection.updateOne(query, updatedDoc);
            res.send(result);
        });



        app.delete('/bookingsProduct/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await bookingsProductCollection.deleteOne(filter);
            res.send(result);
        })

            
        
       

        app.get('/categories', async (req, res) => {
            const query = {}
            const cursor = categoriesCollection.find(query);
            const categories = await cursor.toArray();
            res.send(categories);
        });

        

        // NOTE: we have to use verifyAdmin after verifyJWT
        const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);

            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        }







        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '30d' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        });

        

        // sellers
        
        app.get('/sellers', async (req, res) => {
            const query = {role: 'seller'};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });
       

        // users

        app.get('/users', async (req, res) => {
            const query = {role: 'user'};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });

        app.get('/allusers', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })

        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.role === 'seller' });
        })

        app.delete('/users/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        })

        // app.put('/users/admin/:id', verifyJWT, verifyAdmin, async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: ObjectId(id) }
        //     const options = { upsert: true };
        //     const updatedDoc = {
        //         $set: {
        //             value: 'verified'
        //         }
        //     }
        //     const result = await usersCollection.updateOne(filter, updatedDoc, options);
        //     res.send(result);
        // });

        
      

        

       

    }
    finally {

    }
}
run().catch(console.log);

app.get('/', async (req, res) => {
    res.send('social media server is running');
})

app.listen(port, () => console.log(`social media server running on ${port}`))