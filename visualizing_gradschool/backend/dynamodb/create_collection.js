/* global docClient */
const async = require('async');
const AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.region = "us-east-1";

const blogEntries = [];

// template for data collection
class BlogEntry {
	constructor(sortKey, primaryKey, week, temperature, steps, sleep) {
		this.date = {};
		this.date.S = new Date(sortKey).toDateString(); // string date
		this.energy_level = {};
		this.energy_level.N = primaryKey.toString(); // number, 1 to 10
		this.week = {};
		this.week.S = week; // string
		this.temperature = {};
		this.temperature.NS = temperature.map(t => t.toString()); // number set [high, low]
		this.steps = {};
		this.steps.N = steps.toString(); // number
		this.sleep = {};
		this.sleep.S = sleep; // string, must be formatted properly if used
	}
};

// collect the data
blogEntries.push(new BlogEntry('October 04, 2021', 8, 'w1', [73, 62], 14948, '5:20' ));
blogEntries.push(new BlogEntry('October 05, 2021', 4, 'w1', [64, 60], 8923, '4:40' ));
blogEntries.push(new BlogEntry('October 06, 2021', 2, 'w1', [69, 60], 13389, '3:22' ));
blogEntries.push(new BlogEntry('October 11, 2021', 6, 'w2', [69, 62], 11807, '4:33' ));
blogEntries.push(new BlogEntry('October 12, 2021', 7, 'w2', [69, 60], 11219, '4:04' ));
blogEntries.push(new BlogEntry('October 13, 2021', 3, 'w2', [69, 62], 12363, '5:45' ));
blogEntries.push(new BlogEntry('October 18, 2021', 4, 'w3', [59, 54], 6582, '4:55' ));
blogEntries.push(new BlogEntry('October 19, 2021', 2, 'w3', [64, 50], 6053, '4:54' ));
blogEntries.push(new BlogEntry('October 20, 2021', 2, 'w3', [73, 59], 2524, '5:41' ));
blogEntries.push(new BlogEntry('October 25, 2021', 9, 'w4', [67, 61], 10007, '6:39' ));
blogEntries.push(new BlogEntry('October 26, 2021', 1, 'w4', [63, 55], 7468, '3:23' ));
blogEntries.push(new BlogEntry('October 27, 2021', 7, 'w4', [60, 54], 8178, '5:54' ));



var dynamodb = new AWS.DynamoDB();

async.eachSeries(blogEntries, function(entry, callback) {

  const params = {};
        params.Item = entry;
        params.TableName = "processBlog";


  dynamodb.putItem(params, function (err, data) {

    if(err) {
      console.log(err, err.stack);
    } else {
      console.log('Successfully put item: ', params.Item.date); // successful response
    }
  });

  setTimeout(callback, 1000);

});
