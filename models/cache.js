const sqlite3 = require('sqlite3').verbose()
const file = __dirname + '/../data/db/images.db'
const db = new sqlite3.Database(file)

exports.getCacheHits = (cb) =>  {
    var hits, misses = 0
    db.serialize(function() {
        db.get("SELECT sum(hit) as hits, count(id) as misses FROM files", function(err, row) {
            // console.log("hits : "+row.hits);
            hits = row.hits
            misses = row.misses
            cb(hits, misses)
        })
    })
    
    // db.close()
}

exports.increaseCacheHits = async (image, size, format) =>  {
    
    await db.serialize(function() {
        
        let stmt = db.prepare("update files set hit = hit+1 where name = ? and extension = ? and size = ?")
        
        stmt.run(image, format, size)
        
        stmt.finalize()
        
    });
    
    // db.close();
    
}

exports.insertCache = (image, size, format) =>  {
    db.serialize(function() {
        let data = [image, format, size] 
        let sql = `insert into files (name, extension, size, hit) values (?, ?, ?, 0)`
        db.run(sql, data, function(err) {
            if (err) {
                return console.error(err.message);
            }
            
            console.log(`Row(s) updated: ${this.changes}`);
        });
    });
    
    // close the database connection
    // db.close();
}
