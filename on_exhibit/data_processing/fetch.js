require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const _ = require('underscore');
const async = require('async');
const Path = require('path');

const API_KEY = process.env.API_KEY;
// console.log(API_KEY);

const BASE_URL = "https://api.si.edu/openaccess/api/v1.0/search";

const SEARCH = `type:edanmdm+AND+on%20exhibit%3A"Yes"%20AND%20online_media_type:"Images"`;

// concat the API request url
const url = BASE_URL + "?api_key=" + API_KEY + "&q=" + SEARCH;
// console.log(url);

const saveToFile = "api_data.json";
const updatedFile = 'api_data_updated.json';

const run_fetchSearchData = false,
      run_cleanAndFormat = true,
      run_stats = false,
      run_cacheImages = false,
      run_checkForDataUpdates = false;

if( run_fetchSearchData ) fetchSearchData();
if( run_cleanAndFormat ) cleanAndFormatData();
if( run_cacheImages ) cacheImages();
if( run_checkForDataUpdates ) checkForDataUpdates();

//*************************************************************//
// top level logic for fetching
//*************************************************************//
    // step 1: all logic for fetching the data
    function fetchSearchData(writeFileName = saveToFile, thisUrl = url) {
        let fetchData = new Promise((resolve, reject) => {
            resolve('Data successfully fetched');
            reject('Data fetch failed!');
        });

        // provide the number of rows per page (max for SI API - 1000)
        const pageSize = 1000;

            return fetchData.then(() => {
                 return getSizeOfData(thisUrl)
                    .then(apiDataLength => {
                       return buildQueries(apiDataLength, pageSize, thisUrl)
                        .then(thisQuery => {
                            return fetchTheseData(thisQuery, writeFileName);
                        });
                    });
            })
    }
//*************************************************************//
// top level logic for cleaning and formatting the data
//*************************************************************//
    // step 2: all logic for cleaning and formatting the data
    function cleanAndFormatData(fileToRead = saveToFile) {
        let cleaningAndFormatting = new Promise((resolve, reject) => {
            resolve('Data successfully cleaned and formatted...');
            reject('Data cleaning and formatting failed!');
        });

        return cleaningAndFormatting.then(() => {
            readData(fileToRead)
                .then((data) => {
                     cleanData(data).then((data) => {
                        if(run_stats) {
                            formatData(data).then(() => {
                                stats('formatted_data.json');
                                extractFilters('formatted_data.json');
                            });
                        } else {
                            formatData(data).then(() => {
                                extractFilters('formatted_data.json');
                            });
                        }
                    });
                });
        }).catch( error => console.log(error) );
    }
//*************************************************************//
// logic for filters
//*************************************************************//
function extractFilters(fileToRead = saveToFile) {
    let filters = new Promise((resolve, reject) => {
        resolve('Ran filter extraction...');
        reject('Running filter extraction failed!');
    });

    return filters.then(() => {
        readData(fileToRead)
            .then((data) => {


                let count_museums =  _.chain(data)
                    .pluck('museum')
                    .countBy()
                    .map((v,k) => { return {
                            label: k,
                            value: k.toLowerCase().replace(/\.|\ -/g, '').replace(/\s/g, '_'),
                            count: v
                        }
                    })
                    .sortBy('count').reverse()
                    .value();


                    console.log("######################################################");
                    console.log(`Successfully extracted ${count_museums.length} filters...`);

                    fs.writeFileSync('data/filters.json', JSON.stringify(count_museums));

                    console.log(`Successfully wrote filters file...`);
                    console.log("######################################################");


            });
    }).catch( error => console.log(error) );
}

//*************************************************************//
// logic for stats
//*************************************************************//
    function stats(fileToRead = saveToFile) {
        let stats = new Promise((resolve, reject) => {
            resolve('Ran stats...');
            reject('Running stats failed!');
        });

        return stats.then(() => {
            readData(fileToRead)
                .then((data) => {

                    let count_dates = _.chain(data)
                        .pluck('date')
                        .pluck('label')
                        .countBy()
                        .map((v,k) => { return {year: k, count: v} })
                        .sortBy('count').reverse()
                        .value();

                    let count_museums =  _.chain(data)
                            .pluck('museum')
                            .countBy()
                            .map((v,k) => { return {museum: k, count: v} })
                            .sortBy('count').reverse()
                            .value();

                    let group_museums =  _.chain(data)
                            .groupBy('museum')
                            .mapObject(m => _.groupBy(m, 'dateClean'))
                            .mapObject((year_array, museum_name) => {
                                // console.log(year_array, museum_name)
                                return _.mapObject(year_array, (arr, y) => arr.length)
                            })
                            .mapObject((year_count, museum_name) => {
                                let format = _.map(year_count, (count, year) => {
                                    return { year: year, count: count }
                                });
                                return _.sortBy(format, 'count').reverse()
                            })
                            .value();

                    let stats = { count_dates: count_dates, count_museums: count_museums, group_museums: group_museums }

                            console.log("######################################################");
                            console.log(`Successfully ran stats on ${data.length} datapoints...`);

                            fs.writeFileSync('data/stats.json', JSON.stringify(stats));

                            console.log(`Successfully wrote stats file...`);
                            console.log("######################################################");


                });
        }).catch( error => console.log(error) );
    }

//*************************************************************//
// top level logic for caching images
//*************************************************************//
    // step 3: cache images logic
    function cacheImages() {
        let cache = new Promise((resolve, reject) => {
            resolve('Images successfully cached...');
            reject('Image caching failed!');
        });

        return cache.then(()=> {
            readData()
                .then((data) => {

                    checkIfImagesFolderExist()
                        .then(() => {
                            fetchImages(data);
                    });
            });
        }).catch( error => console.log(error) );
    }
//*************************************************************//
// top level logic for checking the data for updates
//*************************************************************//
function checkForDataUpdates(fileToRead = saveToFile, saveUpdatedFile = updatedFile, shouldCacheImages = false) {
    getSizeOfData(url)
        .then(apiDataLength => {

            readData(fileToRead)
                .then((data) => {
                    if(data.length === apiDataLength) {
                        console.log("######################################################");
                        console.log(`The current file has ${data.length} and the current size of the data in the API is ${apiDataLength}. No update needed!`);
                        console.log("######################################################");
                    } else if(data.length > apiDataLength) {
                        console.log("######################################################");
                        console.log(`The current file has ${data.length} and the current size of the data in the API is ${apiDataLength}. The API returns less data than the existing cached data! Please, check manually to find out the differences!`);
                        console.log("######################################################");
                    } else{
                        console.log("######################################################");
                        console.log("Start downloading of the data...");
                        console.log("######################################################");

                        return fetchSearchData(saveUpdatedFile)
                            .then(() => {
                                return cleanAndFormatData(saveUpdatedFile).then(() => {
                                    if(shouldCacheImages) {
                                        cacheImages();
                                    }
                                });
                        });

                    }
            });
        }).catch( error => console.log(error) );
}

//*************************************************************//
// Reading data utility fn
//*************************************************************//
    function readData(readFile = saveToFile) {

        let readData = new Promise((resolve, reject) => {
            resolve('Data successfully read');
            reject('Data read failed!');
        });

        return readData.then(()=> {

            if (fs.existsSync('data') && fs.existsSync(`data/${readFile}`)) {
                const data = JSON.parse(fs.readFileSync(`data/${readFile}`, 'utf8'));

                console.log("######################################################");
                console.log(`Reading file ${readFile} with ${data.length} artifacts...`);
                console.log("######################################################");

                return data;
            } else {
                console.log("######################################################");
                console.log("Start downloading of the data...");
                console.log("######################################################");

                return fetchSearchData()
                    .then(() => {
                        return cleanAndFormatData();
                });
            }
        }).catch( error => console.log(error) );
    }

//*************************************************************//
// Fetching data logic
//*************************************************************//
function getSizeOfData(url) {
    // getSizeOfData takes one parameter, url,
    // which it gets from parent function fetchSearchData
    // it makes a request for the url and returns the row count
    // from the API response, which tells us how many results exist
    // for that query
    // getSizeOfData returns a promise with the row count

     return axios.get(url)
        .then(function (response) {
            response = response.data.response.rowCount;
            console.log("######################################################");
            console.log(`Data for query has length \n${response}`);
            console.log("######################################################");
            return response;

        }).catch(function (error) {
            console.error(error);
        });
}
// calculate the number of calls to the API based on nRows and pageSize
function buildQueries(nRows, pageSize, url) {

    let buildUrl = new Promise((resolve, reject) => {
        resolve('URL successfully build');
        reject('URL build failed!');
    });

    return buildUrl.then(() => {

        let nQueries = Math.ceil(nRows / pageSize);
        console.log('Number of queries to make: ', nQueries);

        let urls = [];
        let thisUrl;

        // console.log(nQueries);
        for(let i = 0; i < nQueries; i++) {
            if (i == (nQueries-1)) {
                    thisUrl = url + `&start=${i * pageSize}&rows=${nRows - (i * pageSize)}`;
                console.log("######################################################");
                console.log(`Url for last set of pages: \n${thisUrl}`);
                console.log("######################################################");
            } else {
                thisUrl = url + `&start=${i * pageSize}&rows=${pageSize}`;
                console.log("######################################################");
                console.log(`Url for set of pages: \n${thisUrl}`);
                console.log("######################################################");
            }

            urls.push(thisUrl);

        }

        return urls; //fetchTheseData(thisUrl);

    }).catch( error => console.log(error) );
}

function fetchTheseData(urls, writeFileName) {

    if (fs.existsSync('data')) {
        console.log('Directory exists, writing file...');
    } else {
        console.log("Creating directory 'data'...");
        fs.mkdirSync('data');
    }

    let api_data = [];

    async.eachSeries(urls, function(thisUrl, cb) {

        // return fetchUrl.then(() => {
            return axios.get(thisUrl)
                .then(function (response) {
                    response = response.data.response.rows;
                    console.log("######################################################");
                    console.log(`Got data for: \n${thisUrl}`);
                    console.log("######################################################");
                    api_data.push(response);
                    console.log('pushed data in api_data: ', response.length);
                })
                .then(() => {
                    setTimeout(cb, 1000);
                })
                .catch(function (error) {
                    console.error(error);
                });

     }, function() {

        api_data = _.flatten(api_data);

        fs.writeFileSync(`data/${writeFileName}`, JSON.stringify(api_data));

        console.log("######################################################");
        console.log(`Wrote data for: \n${url} \nwith ${api_data.length} artifacts`);
        console.log("######################################################");
        console.log("******************************************");
        console.log('Successfully wrote api-data file!');
        console.log("******************************************");
    });
}

//*************************************************************//
// Cleaning data logic
//*************************************************************//
    function cleanData(data) {
        let clean = new Promise((resolve, reject) => {
            resolve('Data successfully cleaned...');
            reject('Data cleaning failed!');
        });

        // start cleaning the data
        return clean.then(()=> {

            // let cleanData = [];
            // let missingDate = [];
            let clean = {
                data: [],
                missingDate: []
            }
            // check if object has key
            function validateEntry(e, subkey, key_to_test) {
              return e[subkey].hasOwnProperty(key_to_test) ? e[subkey][key_to_test] : false
            }


            // for each entry in the artifacts dataset
            // check if the key value pair exists, take only the ones we use,
            // and save it to a new object with friendlier keys and structure
            data.forEach(e => {

                let entry = {
                    id: e.id,
                    title: e.title,
                    unitCode: e.unitCode,
                    record_link: validateEntry(e.content, 'descriptiveNonRepeating', 'record_link'),
                    museum: validateEntry(e.content, 'descriptiveNonRepeating', 'data_source'),
                    media: validateEntry(e.content.descriptiveNonRepeating, 'online_media', 'media'),
                    date: validateEntry(e.content, 'indexedStructured', 'date'),
                    //exhibit: validateEntry(e.content, 'indexedStructured', 'exhibition'),
                    //object_type: validateEntry(e.content, 'indexedStructured', 'object_type'),
                    //culture: validateEntry(e.content, 'indexedStructured', 'culture'),
                    //name: validateEntry(e.content, 'indexedStructured', 'name'),
                    isExhibited: validateEntry(e.content, 'indexedStructured', 'onPhysicalExhibit'),
                    topic: validateEntry(e.content, 'indexedStructured', 'topic'),
                    // place: validateEntry(e.content, 'indexedStructured', 'place'),
                    geoLocation: validateEntry(e.content, 'indexedStructured', 'geoLocation'),
                    //setName: validateEntry(e.content, 'freetext', 'setName'),
                    //date2: validateEntry(e.content, 'freetext', 'date'),
                    description: validateEntry(e.content, 'freetext', 'notes'),
                    //credit: validateEntry(e.content, 'freetext', 'creditLine'),
                    //name2: validateEntry(e.content, 'freetext', 'name'),
                    //topic2: validateEntry(e.content, 'freetext', 'topic'),
                    //place2: validateEntry(e.content, 'freetext', 'place'),
                    //physicalDescription: validateEntry(e.content, 'freetext', 'physicalDescription')
            };

                // clean the media array
                let media = [];
                if(entry.media) {
                    entry.media.forEach( (thisMedia, i) => {
                    // create a unique id for each image, save to an array
                    // console.log(thisMedia.thumbnail)
                    if(thisMedia.thumbnail.indexOf('3d-api.si.edu') === -1) {
                        media.push(`${e.id}-${i}`);
                    }
                });
                }
                // and replace the detailed media array with just the ids that match the images
                entry.media = media;

                // for each entry in the dataset, find the Cvil Rights string and remove it from topics as it is an error and duplicate key
                // entry.topic = entry.topic ? entry.topic.filter(t => t != 'Cvil Rights') : entry.topic;

                // check if the artifact is exhibited and return a boolean to match the yes/no values
                entry['isExhibited'] = entry['isExhibited'] == 'Yes' ? true : false;
                // for each description, take the content alone from the object and return the string in an array
                entry.description = _.chain(entry.description)
                    .filter(note => note.label === 'Description')
                    .pluck('content')
                    .value();

                entry.description = entry.description.length ? entry.description : false;

                //remove <I> from title
                entry.title = entry.title.replace( /<I>|<\/I>/gi, '');
                //find sensitive words and add a isSensitive flag for each entry to later identify which ones need to be handled
                if( entry.description && entry.title ) {
                    if( entry.title.toLowerCase().includes('negro') || entry.description.join(',').toLowerCase().includes('negro') ||
                        entry.title.toLowerCase().includes('lynching') || entry.description.join(',').toLowerCase().includes('lynching')
                    ) {
                        entry.isSensitive = true;
                    } else {
                        entry.isSensitive = false;
                    }
                }


                // remove topics that are not actual topics but descriptors
                // let  excluded_topics = ['U.S. History', 'Art', 'Music', 'Dance', 'Design', 'Sports', 'Graphic arts', 'Caricature and cartoons', 'Baseball', 'Holidays and festivals', 'Motion pictures', 'Photography', 'Recreation', 'United States History'];

                //   excluded_topics.forEach(excluded => {
                //     entry.topic = entry.topic.filter(topic => {
                //       return topic.indexOf(excluded) === -1;
                //     })
                //   });

                // console.log(e.content.freetext.date)

                // remove the 's' from all dates in the date array
                if( entry['date'] ) {

                    //entry['date'] = entry['date'].map(d => +d.replace(/s/g, '') );

                    // save the entry to the cleanData array
                    clean.data.push(entry);
                } else {
                    clean.missingDate.push(entry);
                }


            });

            console.log("######################################################");
            console.log(`Successfully cleaned ${clean.data.length} datapoints...`);

           fs.writeFileSync('data/clean_data.json', JSON.stringify(clean));

            console.log(`Successfully wrote ${clean.missingDate.length} datapoints with misisng date...`);
            console.log("######################################################");


            return clean.data;
        }).catch( error => console.log(error) );
    }

    function formatData(data) {
        // formatData takes the data from the cleanData fn
        // it finds the dates and topics array
        // and flattens the object structure by making one to one relationship
        // between year and artifact and topic and artifact
        // this is later used on the front end to create a heatmap in d3.js

        let format = new Promise((resolve, reject) => {
            resolve('Data successfully formatted...');
            reject('Data formatting failed!');
        });

        // start formatting the data
        return format.then(()=> {
            // save flat data structure to array
            let flat = [];
            let allowDuplicates = false;

            function flattenDate(d, y, arr) {
                // clone each datapoint
                let o = { ...d };
                // replace date array with the unique date, add era and save to o
                let label = +(y.replace(/s/g, '').replace('BCE ', ''));
                let isBCE =  y.indexOf('BCE') >= 0;

                o.date = { label: isBCE ? -label : label, era: isBCE ? 'BCE' : 'AD', source: y };
                o.dateClean = isBCE ? -label : label;

                // push the modified d to flat and save it
                arr.push(o);
            }


            // for each artifact
            data.forEach( d => {
                // take the arrays of dates and loop

                if(!allowDuplicates) {
                    let theseDates = d.date.sort();

                    // it is a unique artifact
                    if(theseDates.length === 1) {
                        flattenDate(d, theseDates[0], flat);
                    } else if( theseDates.indexOf('BCE') >= 0 ) {
                        // artifact is a duplicate and BCE
                        flattenDate(d, theseDates[theseDates.length-1], flat);
                    } else {
                        // artifact is a duplicate and AD
                        flattenDate(d, theseDates[0], flat);
                    }
                } else {

                  d.date.forEach(y => {
                    // clone each datapoint
                    let o = { ...d };
                    // replace date array with the unique date, add era and save to o
                    let label = +(y.replace(/s/g, '').replace('BCE ', ''));
                    let isBCE =  y.indexOf('BCE') >= 0;

                    o.date = { label: isBCE ? -label : label, era: isBCE ? 'BCE' : 'AD', source: y };
                    o.dateClean = isBCE ? -label : label;

                    // push the modified d to flat and save it
                    flat.push(o);
                  });
                }



            });

            console.log("######################################################");
            console.log(`Successfully formatted ${flat.length} datapoints...`);

            fs.writeFileSync('data/formatted_data.json', JSON.stringify(flat));

            console.log(`Successfully wrote formatted_data to fs...`);
            console.log("######################################################");

            return flat;

        }).catch( error => console.log(error) );
    }
//*************************************************************//
// Caching images logic
//*************************************************************//
    function fetchImages (data) {
        let imageFetch = new Promise((resolve, reject) => {
            resolve('Images successfully fetched...');
            reject('Images fetching failed!');
        });


        return imageFetch.then(() => {
            // data = data.slice(0, 7);

            extractImages(data).then((media) => {

                let timeOutTime = 0;

                async.eachSeries(media, function(image, mediaCb) {
                    console.log("######################################################");
                    console.log(`Start caching ${image.artifactN} artifact: image ${image.index} ${image.type} for ${image.title}...`);

                    let imageName, imageUrl;
                    if(image.hasOwnProperty('thumbnail')) {
                        imageName = `thumb_${image.id}-${image.index}.jpeg`;
                        imageUrl = image.thumbnail;
                    }
                    if(image.hasOwnProperty('screen')) {
                        imageName = `screen_${image.id}-${image.index}.jpeg`;
                        imageUrl = image.screen;
                    }

                    checkIfImageExists(imageName)
                        .then((imageExists) => {
                                // console.log(imageExists);
                            if(!imageExists) {
                                timeOutTime = 2000
                                writeImage(imageUrl, imageName);
                            } else {
                               console.log('this image exists! ', imageExists);
                                timeOutTime = 0;
                            }
                    });

                    // console.log(timeOutTime)
                    setTimeout(mediaCb, timeOutTime);

                    }, function() {
                        console.log("******************************************");
                        console.log('Successfully cached all images!');
                        console.log("******************************************");
                    });
            });

        }).catch( error => console.log(error) );
    }

    function extractImages(data) {
        let extractImage = new Promise((resolve, reject) => {
            resolve('Images successfully extracted...');
            reject('Images extraction failed!');
        });

        return extractImage.then(() => {
            let allMedia = [];

            data.forEach((artifact, n) =>{
                // remove all images and meta data that are not thumb or screen
                let media = artifact['content']['descriptiveNonRepeating']['online_media']['media'];
                    media = media.forEach((thisMedia,i) => {
                            // if image is 3d
                            if(thisMedia.thumbnail.indexOf('3d-api.si.edu') >= 0) {

                                    console.log('image is 3d', ' skip!');
                                    // delete any 3d images which download was attempted
                                    let screen = `screen_${artifact.id}-${i}.jpeg`;
                                    let thumb = `thumb_${artifact.id}-${i}.jpeg`;;


                                if (fs.existsSync(`images/${screen}`) || fs.existsSync(`images/${thumb}`)) {
                                    try {
                                      fs.unlinkSync(`images/${screen}`);
                                      fs.unlinkSync(`images/${thumb}`);
                                      console.log("Successfully deleted the files.", screen, thumb)
                                    } catch(err) {
                                      throw err
                                    }
                                }


                            } else {

                                // retain only the thumb and screen images in media and give them appropriate keys
                                allMedia.push({
                                    thumbnail: `${thisMedia.thumbnail}_thumb`,
                                    index: i,
                                    title: artifact.title,
                                    id: artifact.id,
                                    type: "thumbnail",
                                    artifactN: n
                                });

                                allMedia.push({
                                    screen: `${thisMedia.thumbnail}_screen`,
                                    index: i,
                                    title: artifact.title,
                                    id: artifact.id,
                                    type: "screen",
                                    artifactN: n
                                });
                            }

                    });

            });
            console.log("******************************************");
            console.log(`Successfully extracted ${allMedia.length} images from ${data.length} artifacts`);
            console.log("******************************************");

            return allMedia;

        }).catch( error => console.log(error) );

    }

    function checkIfImageExists(imageName) {
        let ifExists = new Promise((resolve, reject) => {
            resolve(`Image ${imageName} exists...`);
            reject('Image does not exist!');
        });

        return ifExists.then(()=> {
            let itExists = false;

            if (fs.existsSync(`images/${imageName}`)) {
                itExists = true;
                console.log(itExists);
                console.log(`${imageName} already exists...`);
                console.log("######################################################");
            } else {
                itExists = false;
            }

            return itExists;

        }).catch( error => console.log(error) );
    }

    function writeImage(imageUrl, imageName) {
        let saveImage = new Promise((resolve, reject) => {
            resolve('Image successfully saved...');
            reject('Image save failed!');
        });

        return saveImage.then(() => {
            const path = Path.resolve(__dirname, 'images', imageName);
            const writer = fs.createWriteStream(path);

            console.log('Calling url: ', imageUrl);
            console.log("######################################################");

            axios.get(imageUrl, {
                responseType: 'stream'
            })
            .then(response => {
                response.data.pipe(writer);
            })
            .catch(error => {
                console.error(error);
            });

            new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

        }).catch( error => console.log(error) );

    }

    function checkIfImagesFolderExist() {
        let imageFolder = new Promise((resolve, reject) => {
            resolve('Image folder check passed...');
            reject('Images folder check failed!');
        });

        return imageFolder.then(() => {
            if (fs.existsSync('images')) {
                console.log('Directory images exists, writing file...');
            } else {
                console.log("Creating directory 'images'...");
                fs.mkdirSync('images');
            }
        }).catch( error => console.log(error) );
    }
