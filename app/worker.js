var Sequelize = require('sequelize');
var request = require('request');
var sequelize = new Sequelize('mysql://user:password@127.0.0.1/database');
var Alert = require('./alert')(sequelize);
var Promise = require('bluebird');
var moment = require('moment');

var accountSid = '';
var authToken = "";
var client = require('twilio')(accountSid, authToken);
var smsFrom = '';
var smsTo = '';

// Dataset identifiers from civicdata.com
var DATASET_VIOLATIONS = 'f230b8d9-5605-422c-a2eb-dac203f62edb';
var DATASET_INSPECTIONS = '19426f05-1814-4447-b63b-23c33b3706a7';

var baseUrl = "http://www.civicdata.com/api/action/datastore_search_sql?sql=";
var baseSql = "SELECT * from \":dataset\" WHERE business_id = ':business_id' AND date > ':date'";

Alert.findAll().then(function (alerts) {
    alerts.forEach(function (alert) {
        var sql = baseSql.replace(':business_id', alert.business_id);
        sql = sql.replace(':date', moment(alert.lastTriggeredAt).format('YYYY-MM-DD'));

        switch (alert.type) {
        case 'all':
        case 'score':
            sql = sql.replace(':dataset', DATASET_INSPECTIONS);
            break;
        case 'critical':
            sql = sql.replace(':dataset', DATASET_VIOLATIONS);
            break;  
        }

        if (alert.type == 'score') {
            sql += " AND score < '" + alert.value + "'";
        }

        var civicDataRequest = new Promise(function (resolve, reject) {
            request(baseUrl + sql, function (error, response, body) {
                if (error) {
                    console.log(error);
                    return reject(error);
                }

                // Parse the result body
                try {
                    var result = JSON.parse(body);
                    resolve(result);
                } catch (error) {
                    return reject(error);
                }
            });
        });

        civicDataRequest.then(function (result) {
            if (result.result.records.length > 0) {
                if (alert.type == 'all' || alert.type == 'score') {
                    // Send the email alert
                    
                    var textBody;
                    if (alert.type == 'all') {
                        textBody = "New health inspection score for " + alert.business_name + ": " + result.result.records[0].score;
                    } else {
                        textBody = "New health inspection below your specified threshold for " + alert.business_name + ": " + result.result.records[0].score;
                    }

                    client.messages.create({
                        body: textBody,
                        to: smsTo,
                        from: smsFrom
                    }, function(err, message) {
                        if (err) {
                            console.log(err);
                        } else {
                            alert.lastTriggeredAt = new Date;
                            alert.save();
                        }
                    });

                } else {
                    var filtered = result.result.records.filter(function (record) {
                        return record.description.indexOf('CRITICAL VIOLATION') != -1;
                    });
                    if (filtered.length > 0) {
                        // send the critical violation email alert
                        client.messages.create({
                            body: "New critical violation for " + alert.business_name + ": " + filtered[0].description,
                            to: smsTo,
                            from: smsFrom
                        }, function(err, message) {
                            if (err) {
                                console.log(err);
                            } else {
                                alert.lastTriggeredAt = new Date;
                                alert.save();
                            }
                        });
                    }
                }
            }
        });
    });
});
