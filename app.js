let express = require("express");
let app = express();
let bodyParser = require('body-parser')

let connect = require("./modules/connect");
let objectID = require("mongodb").ObjectID;

let db = null;

const PORT = 80;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }))

app.get("/connect", async (req, res) => {
    let conn = (await connect(req.query.ip));
    db = conn.db;
    res.send({
        success: conn.success
    })
})

app.get("/f_db", (req, res) => {
    db.admin().listDatabases((err, dbs) => {
        res.send(dbs.databases);
    });
})

app.get("/f_coll", (req, res) => {
    db.db(req.query.db).collections((err, colls) => {
        let fin = colls.map(el => el.s.name);
        res.send(fin)
    });
})

app.get("/f_doc", (req, res) => {
    db.db(req.query.db).collection(req.query.coll).find({}).toArray((err, items) => {
        res.send(items);
    })
})

app.post("/a_db", (req, res) => {
    console.log(req.body)
    db.db(req.body.name).createCollection("default", (err, r) => {
        let s = true;
        if(err)
            s = false;
        res.send(s);    
    });
})

app.post("/a_coll", (req, res) => {
    db.db(req.body.db).createCollection(req.body.name, (err, r) => {
        let s = true;
        if(err)
            s = false;
        res.send(s);
    });
})

app.post("/a_doc", (req, res) => {
    db.db(req.body.db).collection(req.body.coll).insertOne({}, (err, r) => {
        let s = true;
        if(err)
            s = false;
    
        res.send(s);
    });
})

app.delete("/d_db/:db", (req, res) => {
    console.log(req.params)
    db.db(req.params.db).dropDatabase((err, ok) => {
        res.send(ok);
    });
})

app.delete("/d_coll/:db/:coll", (req, res) => {
    db.db(req.params.db).collection(req.params.coll).drop((err, ok) => {
        res.send(ok);
    });
})

app.delete("/d_doc/:db/:coll/:doc", (req, res) => {
    db.db(req.params.db).collection(req.params.coll).deleteOne({
        _id: objectID(req.params.doc)
    }, (err, r) => {
        let s = true;
        if(err)
            s = false;
        res.send(s);
    });
})

app.put("/m_doc/:db/:coll/:doc", (req, res) => {
    db.db(req.params.db).collection(req.params.coll).updateOne({
        _id: objectID(req.params.doc)
    }, {
        $set: req.body
    }, (err, r) => {
        console.log(err)
        let s = true;
        if(err)
            s = false;
        res.send(s);
    });
});

app.listen(PORT, () => console.log("Hostuje na " + PORT));  