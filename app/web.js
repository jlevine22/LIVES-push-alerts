var express = require('express');
var bodyParser = require('body-parser');
var Sequelize = require('Sequelize');
var sequelize = new Sequelize('mysql://user:password@127.0.0.1/database');
var Alert = require('./alert')(sequelize);
var moment = require('moment');

var app = express();

app.use(express.static('../public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', function (req, res) {
    res.send('Hello World');
})

app.post('/new-alert', function (req, res) {
    console.log(req.body);
    res.status('ok');
    Alert.create({
        email: req.body.email,
        business_id: req.body.business_id,
        business_name: req.body.business_name,
        type: req.body.type,
        value: req.body.value || '',
        createdAt: new Date,
        lastTriggeredAt: new Date
    }).then(function (alert) {
        res.send(alert);
    }).catch(function (error) {
        console.log(error);
        res.status(500).send('Something went wrong');
    });
});

var server = app.listen(3000, function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Example app listening at http://%s:%s', host, port)

});