const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();


app.use(cors());
app.use(express.json());



const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
      return res.status(401).send({ message: 'Unauthorized User' })
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_ACCESS_TOKEN, function (err, decoded) {
      if (err) {
          return res.status(403).send({ message: 'Forbidden Access' })
      }
      req.decoded = decoded;
      next()
  })
}

app.get('/jwt', (req, res) => {
  const email = req.query.email;
  const token = jwt.sign({ email }, process.env.JWT_ACCESS_TOKEN, { expiresIn: '24h' });
  res.send({ token });
})





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hroyggj.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
  try {
    const cameraOptionCollection = client.db('cameraBazar').collection('cameraOptions');
    const bookingsCollection = client.db('cameraBazar').collection('bookings');
    const usersCollection = client.db('cameraBazar').collection('users');
    const addProductCollection = client.db('cameraBazar').collection('addProduct');
    const productsCollection = client.db('cameraBazar').collection('products');
    const ordersCollection = client.db("cameraBazar").collection("orders");
    const paymentsCollection = client.db("cameraBazar").collection("payments");
    const reportedProductsCollection = client.db("cameraBazar").collection("reportedProducts");

    app.get('/cameraOptions', async (req, res) => {
      const query = {};
      const options = await cameraOptionCollection.find(query).toArray();
      res.send(options);
    });
    app.get('/cameraOptions/:id', async (req, res) => {
      const categoryId = req.params.id;
      const query = { id: categoryId };
      const cursor = productCollection.find(query);
      const product = await cursor.toArray();
      res.send(product);
    });
    app.get('/bookings', async (req, res) => {
      const query = {};
      const bookings = await bookingsCollection.find(query).toArray();
      res.send(bookings);
    });
    app.get('/addproducts', async (req, res) => {
      const query = {};
      const options = await addProductCollection.find(query).toArray();
      res.send(options);
    });

    app.post('/cameraOptions', async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });


    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.post('/addproducts', async (req, res) => {
      const addProduct = req.body;
      console.log(addProduct);
      const result = await addProductCollection.insertOne(addProduct);
      res.send(result);
    })


    

    // patch products/id

    app.patch('/products/:id', verifyJWT, verifySeller, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const updateProduct = {
          $set: {
              advertise: 'true'
          }
      }
      const result = await productsCollection.updateOne(filter, updateProduct);
      res.send(result);
  })



    // delete & post report/products

    app.delete('/products/:id', verifyJWT, verifySeller, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const queryOrder = { productId: id };
      const deleteOrder = await ordersCollection.deleteMany(queryOrder);
      const result = await productsCollection.deleteOne(query);
      res.send(result);
  })

  app.post('/report/products', verifyJWT, async (req, res) => {
      const reportedProduct = req.body;
      const reporter = reportedProduct.reporter;
      const productId = reportedProduct.productId;
      const filter = { reporter: reporter, productId: productId };
      const findReport = await reportedProductsCollection.findOne(filter);
      if (findReport) {
          res.send({ message: 'You have already reported this product!' });
          return;
      }
      const result = await reportedProductsCollection.insertOne(reportedProduct);
      res.send(result);
  })

  app.get('/report/products', verifyJWT, verifyAdmin, async (req, res) => {
      const query = {}
      const result = await reportedProductsCollection.find(query).toArray();
      res.send(result);
  })

  app.delete('/report/products/:id', verifyJWT, verifyAdmin, async (req, res) => {
      const productId = req.params.id;
      const queryProduct = { _id: ObjectId(productId) };
      const queryReport = { productId: productId };
      const deleteProduct = await productsCollection.deleteOne(queryProduct);
      const deleteOrder = await ordersCollection.deleteMany(queryReport);
      const deleteReport = await reportedProductsCollection.deleteMany(queryReport);
      res.send(deleteReport);
  })





    // get & post orders verifyJWT


    app.post('/orders', verifyJWT, async (req, res) => {
      const order = req.body;
      const email = order.buyerEmail;
      const productId = order.productId;
      const query = { buyerEmail: email, productId: productId };
      const findOrder = await ordersCollection.findOne(query);
      if (findOrder) {
          res.send({ message: 'You have already booked this product!' })
          return;
      }
      const result = await ordersCollection.insertOne(order);
      res.send(result);
  })

    app.get('/orders', verifyJWT, async (req, res) => {
      const email = req.query.email;
      const query = { buyerEmail: email };
      const result = await ordersCollection.find(query).toArray();
      res.send(result);
  })

  app.get('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.findOne(query);
      res.send(result);
  })



    // payment post


    app.post('/payments', verifyJWT, async (req, res) => {
      const payment = req.body;
      const productId = payment.productId;
      const filterProduct = { _id: ObjectId(productId) };
      const updateProduct = {
        $set: {
          status: 'sold'
        }
      }
      const updatedProduct = await productsCollection.updateOne(filterProduct, updateProduct);

      const orderId = payment.orderId;
      const filterOrder = { _id: ObjectId(orderId) };
      const updateOrder = {
        $set: {
          status: 'paid'
        }
      }
      const updatedOrder = await ordersCollection.updateOne(filterOrder, updateOrder);

      const result = await paymentsCollection.insertOne(payment);
      res.send(result);
    })




  }
  finally {

  }
}
run().catch(console.log);






app.get('/', async (req, res) => {
  res.send('camera bazar server is running');
})

app.listen(port, () => console.log(`camera bazar running ${port}`));