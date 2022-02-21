require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const _ = require('underscore');
const async = require('async');
const Path = require('path');

const API_KEY = process.env.API_KEY;
// console.log(API_KEY);

const BASE_URL = "https://api.si.edu/openaccess/api/v1.0/search";

const SEARCH = `%22Memorabilia+and+Ephemera-Political+and+Activist+Ephemera%22%20AND%20online_media_type:%22Images%22`;

// concat the API request url
const url = BASE_URL + "?api_key=" + API_KEY + "&q=" + SEARCH;
// console.log(url);

const saveToFile = "api_data.json";
const updatedFile = 'api_data_updated.json';

const run_fetchSearchData = false,
      run_cleanAndFormat = false,
      run_cacheImages = false,
      run_checkForDataUpdates = false;

// step 1: all logic for getting the data
if( run_fetchSearchData ) fetchSearchData();
// step 2: format and clean the data 
if( run_cleanAndFormat ) cleanAndFormatData();
// step 3: cache images
if( run_cacheImages ) cacheImages();
// step 4: re run pipeline to update all assets
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
                        formatData(data);
                    });
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
        // console.log(nQueries);
        for(let i = 0; i < nQueries; i++) {

            let thisUrl;

            if (i == (nQueries - 1)) {
                thisUrl = url + `&start=${i * pageSize}&rows=${nRows - (i * pageSize)}`;
            } else {
                thisUrl = url + `&start=${i * pageSize}&rows=${pageSize}`;
            }
            console.log("######################################################");
            console.log(`Url for first set of pages: \n${thisUrl}`);
            console.log("######################################################");
            return thisUrl; //fetchTheseData(thisUrl);
        }

    }).catch( error => console.log(error) );
}

function fetchTheseData(url, writeFileName) {

    return axios.get(url)
        .then(function (response) {
            response = response.data.response.rows;
            console.log("######################################################");
            console.log(`Got data for: \n${url}`);
            console.log("######################################################");
            // console.log(response[0]);
            return response;

        })
        .then(function(response) {
            // check if folder exists, otherwise make it
            if (fs.existsSync('data')) {
                console.log('Directory exists, writing file...');
            } else {
                console.log("Creating directory 'data'...");
                fs.mkdirSync('data');
            }

            fs.writeFileSync(`data/${writeFileName}`, JSON.stringify(response));

            console.log("######################################################");
            console.log(`Wrote data for: \n${url} \nwith ${response.length} artifacts`);
            console.log("######################################################");

            return response;
        })
        .catch(function (error) {
            console.error(error);
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

            let cleanData = [];
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
                    media.push(`${e.id}-${i}`);
                });
                }
                // and replace the detailed media array with just the ids that match the images
                entry.media = media;
                // for each entry in the dataset, find the Cvil Rights string and remove it from topics as it is an error and duplicate key
                entry.topic =  entry.topic.filter(t => t != 'Cvil Rights');
                // remove the 's' from all dates in the date array
                entry['date'] = entry['date'].map(d => +d.replace(/s/g, '') );
                // check if the artifact is exhibited and return a boolean to match the yes/no values
                entry['isExhibited'] = entry['isExhibited'] == 'Yes' ? true : false;
                // for each description, take the content alone from the object and return the string in an array
                entry.description = _.chain(entry.description)
                    .filter(note => note.label === 'Description')
                    .pluck('content')
                    .value();
                //remove <I> from title
                entry.title = entry.title.replace( /<I>|<\/I>/gi, '');
                //find sensitive words and add a isSensitive flag for each entry to later identify which ones need to be handled
                if( entry.title.toLowerCase().includes('negro') || entry.description.join(',').toLowerCase().includes('negro') ||
                    entry.title.toLowerCase().includes('lynching') || entry.description.join(',').toLowerCase().includes('lynching')
                ) {
                    entry.isSensitive = true;
                } else {
                    entry.isSensitive = false;
                }
                // remove topics that are not actual topics but descriptors
                let  excluded_topics = ['U.S. History', 'Art', 'Music', 'Dance', 'Design', 'Sports', 'Graphic arts', 'Caricature and cartoons', 'Baseball', 'Holidays and festivals', 'Motion pictures', 'Photography', 'Recreation', 'United States History'];

                  excluded_topics.forEach(excluded => {
                    entry.topic = entry.topic.filter(topic => {
                      return topic.indexOf(excluded) === -1;
                    })
                  });

            // save the entry to the cleanData array
            cleanData.push(entry);

        });

            console.log("######################################################");
            console.log(`Successfully cleaned ${cleanData.length} datapoints...`);

            fs.writeFileSync('data/clean_data.json', JSON.stringify(cleanData));

            console.log(`Successfully wrote cleanData to fs...`);
            console.log("######################################################");


            return cleanData;
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

            // for each artifact
            data.forEach( d => {
                // take the arrays of dates and loop
              d.date.forEach(y => {
                // take each topoic and loop
                d.topic.forEach(t => {
                    // clone each datapoint
                    let o = { ...d };
                    // replace date array with the unique date and save to o
                    o.date = y;
                    // replace topic array with the unique topic and save to o
                    o.topic = t;
                    // push the modified d to flat and save it
                  flat.push(o);
                });
              });
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
                                console.log(imageExists);
                                timeOutTime = 2000
                                writeImage(imageUrl, imageName);
                            } else {
                                timeOutTime = 0;
                            }
                    });

                    console.log(timeOutTime)
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
                    media = media.forEach((thisMedia,i) =>{
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
                    });
            });
            console.log("******************************************");
            console.log(`Successfully extracted ${allMedia.length} imaged from ${data.length} artifacts`);
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
