const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// Mongo DB Setup
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5732rtt.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const productCollection = client.db("emaJohnDB").collection("products");

    // products get method
    app.get("/products", async (req, res) => {
      const query = req.query;
      const currentPage = parseInt(req.query.page) || 0;
      const productsPerPage = parseInt(req.query.limit) || 5;
      const skip = currentPage * productsPerPage;

      const result = await productCollection
        .find()
        .skip(skip)
        .limit(productsPerPage)
        .toArray();

      res.send(result);
    });

    app.post("/productsById", async (req, res) => {
      const cartProductIds = req.body;

      const cartObjectIds = cartProductIds.map((id) => new ObjectId(id));

      const query = { _id: { $in: cartObjectIds } };

      const result = await productCollection.find(query).toArray();

      res.send(result);
    });

    app.get("/totalProducts", async (req, res) => {
      const totalProducts = await productCollection.estimatedDocumentCount();
      res.send({ totalProducts });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.log);

app.get("/", (req, res) => {
  res.send("Ema John Server is up and running");
});

app.listen(port, () => {
  console.log("Ema John server is running on port: ", port);
});
