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

    app.post('/cameraOptions',async(req,res)=>{
      const booking=req.body;
      console.log(booking);
      const result=await productCollection.insertOne(booking);
      res.send(result);
    })


    // app.get('/singlepage',async(req,res)=>{
    //   const query={};
    //   const products=await productCollection.find(query).toArray();
    //   res.send(products);
    // });
    // app.get('/singlepage/:id',async(req,res)=>{
    //   const id=req.query.id;
    //   const query={id:ObjectId(id)};
    //   const result=await productCollection.findOne(query);
    //   res.send(result);
    // });



    // app.get('/bookings/:id',async(req,res)=>{
    //   const id =req.params.id;
    //   const query={_id:ObjectId(id)};
    //   const booking =await bookingsCollection.findOne(query);
    //   res.send(booking);
    // })

  }
  finally {

  }
}
run().catch(console.log);






app.get('/', async (req, res) => {
  res.send('camera bazar server is running');
})

app.listen(port, () => console.log(`camera bazar running ${port}`));