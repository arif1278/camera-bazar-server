const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();


app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hroyggj.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
  try {
    const cameraOptionCollection = client.db('cameraBazar').collection('cameraOptions');
    const productCollection = client.db('cameraBazar').collection('products');
    const bookingsCollection = client.db('cameraBazar').collection('bookings');
    const usersCollection = client.db('cameraBazar').collection('users');
    const addProductCollection = client.db('cameraBazar').collection('addProduct');

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
    app.get('/bookings',async(req,res)=>{
      const query={};
      const bookings=await bookingsCollection.find(query).toArray();
      res.send(bookings);
    });
    app.get('/addproduct', async (req, res) => {
      const query = {};
      const options = await addProductCollection.find(query).toArray();
      res.send(options);
    });

    app.post('/cameraOptions',async(req,res)=>{
      const booking=req.body;
      console.log(booking);
      const result=await bookingsCollection.insertOne(booking);
      res.send(result);
    });


    app.post('/users',async(req,res)=>{
      const user=req.body;
      const result=await usersCollection.insertOne(user);
      res.send(result);
    });

    app.post('/addproduct',async(req,res)=>{
      const addProduct=req.body;
      console.log(addProduct);
      const result=await addProductCollection.insertOne(addProduct);
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