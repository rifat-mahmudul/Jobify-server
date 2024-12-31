const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.zee3o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const jobsCollection = client.db('Jobify').collection('jobs');
        const usersCollection = client.db('Jobify').collection('users');
        const requestCollection = client.db('Jobify').collection('requests');

        //post user data on DB
        app.post('/users', async(req, res) => {
            try {
                const user = req.body;
                const result = await usersCollection.insertOne(user);
                res.send(result);
            } catch (error) {
                console.log(`error from post user ${error}`);
                res.status(500).send({message : `error from post user ${error}`})
            }
        })

        //get all user data from DB
        app.get('/users', async(req, res) => {
            try {
                const result = await usersCollection.find().toArray();
                res.send(result);
            } catch (error) {
                console.log(`error from get user ${error}`);
                res.status(500).send({message : `error from get user ${error}`})
            }
        })

        //update user info from DB
        app.patch('/users/update/:email', async(req, res) => {
            try {
            const email = req.params.email;
            const user = req.body;
            const query = {email : email};
            const updateDoc = {
                $set : {
                    ...user,
                    Timestamp : Date.now()
                }
            }

            const result = await usersCollection.updateOne(query, updateDoc);
            res.send(result);

            } catch (error) {
                console.log(`error from update user info ${error}`);
                res.status(500).send(`error from update user info ${error}`)
            }
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('SERVER IS RUNNING.....');
})

app.listen(port, () => {
    console.log(`server is running from ${port}`);
})