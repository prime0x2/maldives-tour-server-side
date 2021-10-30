const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;


/* ------------------ MiddleWare ------------------ */
app.use(cors());
app.use(express.json());



/* ------------ Connection to Database ------------ */

const mongoURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jboz5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log("Connected to Database...");
        
        const database = client.db('maldivesTour');
        const agentsCollection = database.collection('agents');
        const bookingCollection = database.collection('bookings');
        
        // Get All Agents
        app.get('/agents', async (req, res) => {
            const cursor = agentsCollection.find({});
            const agents = await cursor.toArray();
            
            res.send(agents);
        });
        
        // GET Single Agent
        app.get('/agents/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const agent = await agentsCollection.findOne(query);
            
            res.json(agent);
        });
        
        // GET All Bookings
        app.get('/booking', async (req, res) => {
            const cursor = bookingCollection.find({});
            const bookings = await cursor.toArray();
            
            res.send(bookings);
        });
        
        // Filter My Bookings
        app.post('/myBookings', async (req, res) => {
            const author = req.body.author;
            const query = { author: author };
            
            const myBookings = await bookingCollection.find(query).toArray();
            console.log(myBookings);
            res.send(myBookings);
        });
        
        // POST booking details
        app.post('/booking', async (req, res) => {
            const bookingDetails = req.body;
            const result = await bookingCollection.insertOne(bookingDetails);
            
            res.json(result);
        });
        
        // Approve booking
        app.put('/booking/status/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateStatus = {
                $set: {
                    status: "Approved"
                }
            };
            const result = await bookingCollection.updateOne(filter, updateStatus, options);
            res.json(result);
        });
        
        // DELETE single Booking
        app.delete('/booking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookingCollection.deleteOne(query);
            
            console.log(result);
            res.json(result);
        });
        
        //  POST / Add new Agent
        app.post('/agents', async (req, res) => {
            const agent = req.body;
            const result = await agentsCollection.insertOne(agent);
            
            res.json(result);
        });
    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);


/* --------- Checking If Server is Running --------- */
app.get('/', (req, res) => {
    res.send('Running Backend Server....!!!');
});


/* --------------- Listening to Port --------------- */
app.listen(port, () => {
    console.log("Listening to Port", port, "$");
});