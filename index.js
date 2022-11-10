const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken')

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port =process.env.PORT || 5000;

require('dotenv').config();

// middle ware

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.y8s6gcn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if(!authHeader){
        res.state(401).send({message: 'unauthorized access '})
    }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,function(err,decoded){
    if(err){
        res.state(401).send({message: 'unauthorized access'})
    }
    req.decoded = decoded;
    next();
  })  
}



async function run(){
    try{
        const travelCollection = client.db('travelGuidline').collection('tourServices')
        const reviewCollection = client.db('travelGuidline').collection('review')
        

        app.post('/jwt', (req, res) =>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn: '10h'})
            res.send({token})
        })


        app.get('/tourServices', async(req,res)=>{
           const query = {}
           const cursor =travelCollection.find(query)
           const tourServices = await cursor.limit(3).toArray();
           res.send(tourServices)
       })

        app.get('/tourAllCard', async (req, res) => {
            const query = {}
            const cursor = travelCollection.find(query)
            const tourServices = await cursor.toArray();
            res.send(tourServices)

        })

        app.get('/tourServices/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tourServices = await travelCollection.findOne(query);
            res.send(tourServices);
        });

        // Review api
        app.get('/review', verifyJWT, async (req,res) =>{
            
            let query = {};
            if(req.query.email){
                query ={
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query)
            const review = await cursor.toArray();
            res.send(review)
        });

        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });

        app.delete('/review/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })

    }
   
    finally{

    }
}
run().catch(err=>console.log(err));





app.get('/',(req,res)=>{
    res.send('travels and tour server is running')
});

app.listen(port, ()=>{
    console.log(`travels and tour server running on ${port}`);
});