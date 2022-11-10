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
       return res.state(403).send({message: 'unauthorized access '})
    }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,function(err,decoded){
    if(err){
      return  res.state(403).send({message: 'unauthorized access'})
    }
    req.decoded = decoded;
    next();
  })  
}



async function run(){
    try{
        const travelCollection = client.db('travelGuidline').collection('tourServices')
        const reviewCollection = client.db('travelGuidline').collection('review')
        

        app.post('/jwt', async (req, res) =>{
            const user = req.body;
            const token = await jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn: '10h'})
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
            const decoded = req.decoded;
           

            if (decoded.email !== req.query.email){
                res.status(403).send({message: 'unauthorized access'})
            }

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

        // delete review
        app.delete('/review/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })



        // update review
        app.put("/update/:id", async (req, res) => {
            const { id } = req.params;
            const query = { _id: ObjectId(id) };
            const review = req.body;
            const options = { upsert: true };
            const updateReview = {
                $set: {
                    name: review.name,

                    email: review.email,
                    
                    message: review.message,
                    
                },
            };
            const result = await reviewCollection.updateOne(
                query,
                updateReview,
                options
            );
            res.send(result);
        });

        app.get("/reviewOne/:id", async (req, res) => {
            const id = req.params.id;
            const status = req.body.status
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.findOne(query);
            res.send(result);
        });

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