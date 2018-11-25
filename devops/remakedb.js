//deletes, creates db, indexes, and puts a few records out
//admin/admin is the admin user created
const nano = require('nano')('http://localhost:5984')
const bcrypt = require('bcryptjs')

//delete and recreate existing db
const run = async () => {
    await nano.db.destroy('soldier').catch(e => console.log('no db found, creating...'))
    await nano.db.create('soldier')
    const db = nano.use('soldier')
    //idx's
    await db.insert(
    {
        _id: "_design/soldier",
        views: {
            all: {
                map: "function(doc) {if (doc.type == \"soldier\") emit(null, doc);\n}"
            }
        }
    }).catch(e => console.log('idx creation failed'))
    
    //sample data
    await db.insert(
        {
            "type": "soldier",
            "firstName": "John",
            "lastName": "Doe",
            "rank": "Captain",
            "branch": "Air Force",
            "conflict": "World War II",
            "dob": "11/15/1963",
            "dod": "12/13/1985",
            "geo": {
                "latitude": 42.03948,
                "longitude": -88.8567131
            },
            "bio": "John was in the invasion of Normandy. He served four years in the Air Force.  At the end of World War II, he returned home and became an architect."
         }
    ).catch(e => console.log('sample data insert failed'))

    await db.insert(
        {
            "type": "soldier",
            "firstName": "Fank",
            "lastName": "Smith",
            "rank": "Captain",
            "branch": "Marines",
            "conflict": "Iraq",
            "dob": "11/15/1963",
            "dod": "12/13/1985",
            "geo": {
                "latitude": 42.03948,
                "longitude": -88.8567131
            },
            "bio": "John served 8 years from the start of the first war in Iraq. He was killed in action and received a medal of Honor for his service."
        }
    ).catch(e => console.log('sample data insert failed'))

    //admin user
    var hash = bcrypt.hashSync('p3anutbutt3r', 8);
    await db.insert(
        {
            "_id": "admin",
            "type": "user",
            "hash": hash
        }
    ).catch(e => console.log('sample data insert failed'))
}

run().then(console.log('done'))

