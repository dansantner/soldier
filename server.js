const express = require('express')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const path = require('path')

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

const Ddos = require('ddos')
const ddos = new Ddos({burst:20,limit:100})
app.use(ddos.express)

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