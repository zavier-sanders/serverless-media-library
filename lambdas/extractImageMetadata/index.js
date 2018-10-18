// dependencies
const AWS = require('aws-sdk');
const gm = require('gm').subClass({imageMagick: true}); // Enable ImageMagick integration.
const util = require('util');
const Promise = require('bluebird');
Promise.promisifyAll(gm.prototype);

// get reference to S3 client
const s3 = new AWS.S3();

exports.handler = (event, context, callback) => {
    // Read input from the event.
    console.log("Reading input from event:\n", util.inspect(event, {depth: 5}));
    const srcBucket = event.s3Bucket;
    // Object key may have spaces or unicode non-ASCII characters.
    const srcKey = decodeURIComponent(event.s3Key.replace(/\+/g, " "));

    var getObjectPromise = s3.getObject({
        Bucket: srcBucket,
        Key: srcKey
    }).promise();

    getObjectPromise.then((getObjectResponse) => {
        console.log('getObjectResponse', getObjectResponse);
        if (getObjectResponse.Metadata.type == 'application/pdf') {
            var pdf = {
                'Base filename': '-',
                Format: 'PDF (Portable Document Format)',
                format: 'PDF',
                fileSize: getObjectResponse.ContentLength,
                dimensions: { width: 850, height: 1661 },
                Resolution: '72x72'
            };
            
            callback(null, pdf); 
        } else if (getObjectResponse.Metadata.type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            var docx = {
                'Base filename': '-',
                Format: 'DOCX',
                format: 'DOCX',
                fileSize: getObjectResponse.ContentLength,
                dimensions: { width: 850, height: 1661 },
                Resolution: '72x72'
            };
            
            callback(null, docx);
        } else if (getObjectResponse.Metadata.type == 'application/msword') {
            var doc = {
                'Base filename': '-',
                Format: 'DOC',
                format: 'DOC',
                fileSize: getObjectResponse.ContentLength,
                dimensions: { width: 850, height: 1661 },
                Resolution: '72x72'
            };
            
            callback(null, doc);
        } else if (getObjectResponse.Metadata.type == 'text/plain') {
            var text = {
                'Base filename': '-',
                Format: 'TXT',
                format: 'TXT',
                fileSize: getObjectResponse.ContentLength,
                dimensions: { width: 850, height: 1661 },
                Resolution: '72x72'
            };
            
            callback(null, text);
        } else {
            gm(getObjectResponse.Body).identifyAsync().then((data) => {
                console.log("Identified metadata:\n", util.inspect(data, {depth: 5}));
                callback(null, data);
            }).catch(function (err) {
                callback(new ImageIdentifyError(err));
    
            });    
        }
        
    }).catch(function (err) {
        callback(err);
    });
};

function ImageIdentifyError(message) {
    this.name = "ImageIdentifyError";
    this.message = message;
}
ImageIdentifyError.prototype = new Error();
