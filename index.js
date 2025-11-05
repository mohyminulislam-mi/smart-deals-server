// Import dependencies
const express = require("express");
const cors = require("cors");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// Create app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://smartUserDB:yWjSihLF55jNaACc@mohyminulislam.uwhwdlk.mongodb.net/?appName=Mohyminulislam";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db("smart_DB");
    const productCollections = db.collection("products");
    const bidsCollections = db.collection("bids");
    const userCollections = db.collection("users");

    // latest products
    app.get("/latest-products", async (req, res) => {
      const cursor = productCollections
        .find()
        .sort({ created_at: -1 })
        .limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });
    // users Collections
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const query = { email: email };
      const existingUser = await userCollections.findOne(query);
      if (existingUser) {
        res.send({ message: "User already exist" });
      } else {
        const result = await userCollections.insertOne(newUser);
        res.send(result);
      }
    });

    // create data on database
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productCollections.insertOne(newProduct);
      res.send(result);
    });
    // get data on database
    app.get("/products", async (req, res) => {
      console.log(req.query);
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const cursor = productCollections.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      console.log("id", id);

      const query = { _id: new ObjectId(id) };
      const result = await productCollections.findOne(query);
      res.send(result);
    });

    // update data on database
    app.patch("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updateProduct = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          name: updateProduct.name,
          price: updateProduct.price,
        },
      };
      const result = await productCollections.updateOne(query, update);
      res.send(result);
    });

    // delete data on database
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollections.deleteOne(query);
      res.send(result);
    });
    //bids related apis
    app.get("/bids", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.buyer_email = email;
      }

      const cursor = bidsCollections.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    // create bids data on database
    app.post("/bids", async (req, res) => {
      const newBids = req.body;
      const result = await bidsCollections.insertOne(newBids);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("✅ You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);

//default route
app.get("/", (req, res) => {
  res.send("Your server is ready");
});

// Start server
app.listen(port, () => {
  console.log(`Server running : ${port}`);
});
