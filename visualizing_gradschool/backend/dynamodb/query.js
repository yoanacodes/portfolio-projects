const async = require('async');
const AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.region = "us-east-1";

const dynamodb = new AWS.DynamoDB();

// scan to get all items in the table
let queryParams = {
    TableName: "processBlog",
};
let count = 0;

function onScan(err, data) {
    console.log("***** ***** ***** ***** ***** \nQuerying table...");
    if (err) {
        console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Scan succeeded.");
        data.Items.forEach(function(itemdata) {
          console.log("Item :", ++count, JSON.stringify(itemdata));
        });

        // continue scanning if we have more items
        if (typeof data.LastEvaluatedKey != "undefined") {
            console.log("Scanning for more...");
            queryParams.ExclusiveStartKey = data.LastEvaluatedKey;
            docClient.scan(queryParams, onScan);
        }
    }
}

dynamodb.scan(queryParams, onScan);

function queries() {
    const searchEnergyLevel = 9;
    // query an energy level with specific value
    const querySpecificEnergyLevel = {
        TableName : "processBlog",
        KeyConditionExpression: "#el = :energy_level",
        ExpressionAttributeNames:{
            "#el": "energy_level",
        },
        ExpressionAttributeValues: {
            ":energy_level": {N: searchEnergyLevel.toString()}
        }
    };
    // query an energy level with specific value and date range
    const queryEnergyLevelAndDates = {
        TableName : "processBlog",
        KeyConditionExpression: "#el = :energy_level and #dt between :minDate and :maxDate", // the query expression
        ExpressionAttributeNames: { // name substitution, used for reserved words in DynamoDB
            "#el" : "energy_level",
            "#dt" : "date"
        },
        ExpressionAttributeValues: { // the query values
            ":energy_level": {N: searchEnergyLevel.toString()},
            ":minDate": {S: new Date("October 04, 2021").toDateString()},
            ":maxDate": {S: new Date("October 27, 2021").toDateString()}
        }
    };


    dynamodb.query(queryEnergyLevelAndDates, function(err, data) {
        console.log("***** ***** ***** ***** ***** \nQuerying for data range...");
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log("Query succeeded.");
            data.Items.forEach(function(item) {
                console.log("***** ***** ***** ***** ***** \n", JSON.stringify(item));
            });
        }
    });
}

// queries();
