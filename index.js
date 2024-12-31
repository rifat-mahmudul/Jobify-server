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


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

        //get single user by email
        app.get('/user/:email', async(req, res) => {
            try {
                const email = req.params.email;
                const query = {email : email};
                const result = await usersCollection.findOne(query);
                res.send(result);
            } catch (error) {
                console.log(`error from get single user ${error}`);
                res.status(500).send(`error from get single user ${error}`)
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

        //delete a user form DB
        app.delete('/user/:email', async(req, res) => {
            try {
                const email = req.params.email;
                const query = {email : email};
                const result = await usersCollection.deleteOne(query);
                res.send(result);
            } catch (error) {
                console.log(`error from delete user ${error}`);
                res.status(500).send(`error from delete user ${error}`);
            }
        })

        //post job in DB
        app.post('/jobs', async(req, res) => {
            try {
                const jobs = req.body;
                const result = await jobsCollection.insertOne(jobs);
                res.send(result);
            } catch (error) {
                console.log(`error from post jobs : ${error}`);
                res.status(500).send(`error from post jobs : ${error}`);
            }
        })

        //get all job from DB
        app.get('/jobs', async(req, res) => {
            try {
                const result = await jobsCollection.find().toArray();
                res.send(result);
            } catch (error) {
                console.log(`error from get all job : ${error}`);
                res.status(500).send(`error from get all job : ${error}`)
            }
        })

        //get single job data from DB
        app.get('/job/:id', async(req, res) => {
            try {
                const id = req.params.id;
                const query = {_id : new ObjectId(id)};
                const result = await jobsCollection.findOne(query);
                res.send(result);
            } catch (error) {
                console.log(`error from get single job data : ${error}`);
                res.status(500).send(`error from get single job data : ${error}`)
            }
        })

        //get single job data for buyer
        app.get('/job/:email', async(req, res) => {
            try {
                const email = req.params.email;
                const query = {'buyer_email' : email};
                const result = await jobsCollection.findOne(query);
                res.send(result);
            } catch (error) {
                console.log(`error from get single job data from buyer : ${error}`);
                res.status(500).send(`error from get single job data from buyer : ${error}`)
            }
        })

        //get single job data for applicant
        app.get('/job/:email', async(req, res) => {
            try {
                const email = req.params.email;
                const query = {'user.email' : email};
                const result = await jobsCollection.findOne(query);
                res.send(result);
            } catch (error) {
                console.log(`error from get single job data from buyer : ${error}`);
                res.status(500).send(`error from get single job data from buyer : ${error}`)
            }
        })

        //update job data in DB
        app.patch('/job/:id', async(req, res) => {
            try {
                const id = req.params.id;
                const query = {_id : new ObjectId(id)};
                const job = req.body;
                const updateDoc = {
                    $set : {
                        ...job
                    }
                }
                
                const result = await jobsCollection.updateOne(query, updateDoc);
                res.send(result);
            } catch (error) {
                console.log(`error from update job data : ${error}`);
                res.send(500).status(`error from update job data : ${error}`)
            }
        })

        //delete job data from DB by buyer
        app.delete('/job/:id', async(req, res) =>{
            try {
                const id = req.params.id;
                const query = {_id : new ObjectId(id)};
                const result = await jobsCollection.deleteOne(query);
                res.send(result);
            } catch (error) {
                console.log(`error from delete job data from DB by buyer : ${error}`);
                res.status(500).send(`error from delete job data from DB by buyer : ${error}`)
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