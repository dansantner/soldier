const express = require('express')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const path = require('path')
const fileUpload = require('express-fileupload');

const app = express()
//*********************************************
//change to 80 in production
//*********************************************
const port = 5000 
//*********************************************
const nano = require('nano')('http://localhost:5984')
const db = nano.use('soldier')

var jsonParser = bodyParser.json()

app.use(cookieParser())

app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: 'peanut butter and jelly',
    cookie: { maxAge: 500000000} //a little less than a week.
}))

//const Ddos = require('ddos')
//const ddos = new Ddos({burst:20,limit:100})
//app.use(ddos.express)

app.get('/soldiers', async (req, res) => {
    const soldiers = (await db.view('soldier', 'all')).rows.map(r => r.value)
    res.send(soldiers)
})

app.get('/login', jsonParser, async (req, res) => {
    res.send({ok: !!req.session.secure})
})

app.post('/login', jsonParser, async (req, res) => {
    const p = req.body.p
    if (!p || typeof p != 'string') {
        res.send(401)
        return
    }
    if (p === '' || p.toLowerCase() === 'password' || p.toLowerCase() === 'admin') {
        res.send(401)
        return
    }
    const admin = await db.get('admin')
    const isValid = bcrypt.compareSync(req.body.p, admin.hash)
    if (isValid) {
        req.session.secure = true
        req.session.save()
        res.send({ok:true})
    } else {
        delete req.session.secure
        req.session.save()
        res.send({ok:false})
    }
})

app.post('/soldiers', jsonParser, async (req, res) => {
    if (!req.session.secure) {
        res.sendStatus(403)
    } else {
        let doc = req.body
        doc.type = 'soldier'
        db.insert(doc).then((body) => {
            res.send(body)
        });
    }
})

app.delete('/soldiers', jsonParser, async (req, res) => {
    if (!req.session.secure) {
        res.sendStatus(403)
    } else {
        let doc = req.body
        doc.type = 'soldier'
        db.destroy(doc._id, doc._rev).then((body) => {
            res.send(body)
        });
    }
})

app.use(fileUpload())

//post stone image for soldier with id
app.post('/stone/:id', function(req, res) {
    if (!req.session.secure) { //admin only
        return res.sendStatus(403)
    }
    if (Object.keys(req.files).length == 0) {
      return res.status(400).send('No files were uploaded.');
    }

    const id = req.params.id
  
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let {data, mimetype, name} = req.files.aFile

    switch(mimetype) {
        case 'image/gif':
        case 'image/png':
        case 'image/jpeg':
            name = 'stone'
            break
        default:
            res.status(415).send('only gif, png, jpeg accepted')
    }
  
    db.get(id, (e, d) => {
        if (!e) {
            db.attachment.insert(id, name, data, mimetype,
            { rev: d._rev }, (ea, da) => {
                if (!ea){
                    return res.send(da)
                } else {
                    return res.status(500).send(ea)
                }
            })
        } else {
            return res.status(500).send(e);
        }
    })
});

app.get('/stone/:id', (req, res) => {
    const id = req.params.id
    db.attachment.get(id, 'stone', (e, b) => {
        if (!e) {
            res.send(b)
        } else {
            res.redirect('/blank.png')
        }
    })
})
  

//*********************************************
// uncomment in production
//*********************************************
/*
app.get('/admin', (req, res) => {
    res.redirect('/?admin=true');
})
app.use(express.static(path.join(__dirname, 'build')));
*/
app.listen(port, () => console.log(`Solder app listening on port ${port}!`))