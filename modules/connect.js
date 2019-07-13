let objectID = null;
let client = null;
let db = null;
let conn = null;

module.exports = function(url) {
    return new Promise((resolve, reject) => {
        client = require('mongodb').MongoClient;
        objectID = require('mongodb').ObjectID;
    
        conn = new Connection(url);
        conn.connect(url).then(conn => {
            resolve({
                db: db,
                success: conn
            })
        });
    })   
}

class Connection{

    async connect(url) {
        let isConnected = false;
        await client.connect(`mongodb://${url}`).then(database => {
            db = database;
            isConnected = true;
        }).catch(err => {
            console.log(err)
        });

        return isConnected;
    }

    list() {
        return new Promise((resolve, reject) => {
            db.admin().listDatabases((err, dbs) => {
                if(err)
                    reject(err);
                else
                    resolve(dbs.databases);
            });
        })
    }
}
