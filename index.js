const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { response } = require('express');
var jwt = require('jsonwebtoken');
const { send } = require('express/lib/response');

const port = process.env.PORT || 5000;
require('dotenv').config();

// middlewerare
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOTEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wv37g.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const newStockServiceCollection = client.db('stockingService').collection('stock');
        const orderCollection = client.db('stockingService').collection('stockOrder');

        // AUTH
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOTEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

        // StockServices API
        app.get('/stockService', async (req, res) => {
            const query = {};
            const cursor = newStockServiceCollection.find(query);
            const StockServices = await cursor.toArray();
            res.send(StockServices);
        });




        app.get('/stockService/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const service = await newStockServiceCollection.findOne(query);
            res.send(service);
        });

        // POST
        app.post('/stockService',verifyJWT, async (req, res) => {
            const newStockServices = req.body;
            const result = await newStockServiceCollection.insertOne(newStockServices);
            res.send(result);
        });


        // upadate user 

        app.put('/stock/:id',verifyJWT, async (req, res) => {
            const id = req.params.id;
            const updateData = req.body;
            const filter = { _id: ObjectId(id) };
            const option = { upsert: true };
            const udatedDoc = {
                $set: {
                    name: updateData.name,
                    price: updateData.price,
                    description: updateData.description,
                    quantity: updateData.quantity,
                    stock: updateData.stock,
                    subName: updateData.subName,
                    img: updateData.img,
                    email:updateData.email
                }
            }
            const result = await newStockServiceCollection.updateOne(filter, udatedDoc, option)
            res.send(result)
        })
        app.put('/edit/:id',verifyJWT, async (req, res) => {
            const id = req.params.id;
            const updateData = req.body; 
            const filter = { _id: ObjectId(id) };
            const option = { upsert: true };
            const udatedDoc = {
                $set: {
                    name: updateData.name,
                    price: updateData.price,
                    description: updateData.description,
                    quantity: updateData.quantity,
                    subName: updateData.subName,
                    img: updateData.img,
                    email:updateData.email
                }
            }
            const result = await newStockServiceCollection.updateOne(filter, udatedDoc, option)
            res.send(result)
        })


        // DELETE
        app.delete('/stockService/:id',verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await newStockServiceCollection.deleteOne(query);
            res.send(result);
        });

        // Order Collection API

        app.get('/love', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = orderCollection.find(query);
                const orders = await cursor.toArray();
                res.send(orders);
            }
            else {
                res.status(403).send({ message: 'forbiden  accespoitn' })
            }
        })

        app.post('/love', async (req, res) => {
            const loveOrder = req.body;
            const result = await orderCollection.insertOne(loveOrder);
            res.send(result);
        })

    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Stoking and herokuuu servers start');
});



app.listen(port, () => {
    console.log('Listening to port', port);
})