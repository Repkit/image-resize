const sqlite3 = require('sqlite3').verbose()
const file = __dirname + '/../data/db/images.db'
const db = new sqlite3.Database(file)

 exports.getCacheHits = async (cb) =>  {
    var hits = 0
    await db.all("SELECT sum(hit) as hits FROM files", function(err, rows) {
        rows.forEach(function (row) {
            // console.log('row: ', row.hits)
            cb(row.hits)
        })
	})
	   
    db.close()
}