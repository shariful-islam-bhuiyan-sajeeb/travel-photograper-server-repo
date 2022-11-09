const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port =process.env.PORT || 5000;

require('dotenv').config();

// middle ware

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.y8s6gcn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const travelCollection = client.db('travelGuidline').collection('tourServices')
        const reviewCollection = client.db('travelGuidline').collection('review')

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