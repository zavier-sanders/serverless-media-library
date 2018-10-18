import {CONFIG} from './config'
import AWS from 'aws-sdk'

AWS.config.region = CONFIG.Region;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({IdentityPoolId: CONFIG.CognitoIdentityPool});
const docClient = new AWS.DynamoDB.DocumentClient({
  region: CONFIG.Region
});
const S3 = new AWS.S3();

export function getInfo(imageID) {

  const params = {
    TableName: CONFIG.DDBAssetsTable,
    Key: {
      imageID: imageID //.replace('+', '%2B').replace('@', '%40')
    }
  };
  let promise = new Promise((resolve, reject) => {
    docClient.get(params).promise().then((data) => {
      //console.log('getInfo', data);
      resolve(data.Item);
    }).catch((err) => {
      reject(err);
    });
  });

  return promise;
}

export function createCollection(collectionData) {
  var params = {
      TableName: CONFIG.DDBCollectionsTable,
      Item:{
          "collectionID": collectionData.collectionID,
          "creationTime": collectionData.creationTime,
          "name": collectionData.name,
          "userID": collectionData.userID,
          "currentStatus": 'active',
          "people": collectionData.people
      },
      ConditionExpression: 'attribute_not_exists (collectionID)'
  };

  let promise = new Promise((resolve, reject) => {
    docClient.put(params).promise().then((data) => {
      console.log('createCollection', data);
      resolve(data.Item);
    }).catch((err) => {
      reject(err);
    });
  });

  return promise;
}

export function uploadAsset(params) {
  
  let promise = new Promise((resolve, reject) => {
    // S3.upload(params.Key, params.Body, {
    //   // contentType: 'application/octet-stream',
    //   bucket: CONFIG.S3DAMBucket,
    //   metadata: params.Metadata,
    //   ACL:'public-read'
    // })
    // .then((data ) => {
    //   resolve(data);
    // }).catch((err) => {
    //   reject(err);
    // })

    S3.upload(params, (err, s3res) => {
        if (err){
          reject(err);
        } else {
          console.log('s3res', s3res);
          resolve(s3res);
        }
    });
  });

  return promise;
}

export function getCollection(ID) {
  var params = {
    TableName: CONFIG.DDBCollectionsTable,
    KeyConditionExpression: 'collectionID = :ID',
    ExpressionAttributeValues: {
      ':ID': ID
    }
  };
  let promise = new Promise((resolve, reject) => {
    docClient.query(params).promise().then((data) => {
      //console.log('getCollections', data);
      resolve(data.Items[0]);
    }).catch((err) => {
      reject(err);
    });
  });

  return promise;
}

export function getCollections(email) {
  var params = {
    TableName: CONFIG.DDBCollectionsTable,
    IndexName: 'status-index',
    KeyConditionExpression: '#s = :status',
    FilterExpression: '(contains(people, :people) OR contains(userID, :owner))',
    ExpressionAttributeValues: {
      ':status': 'active',
      ':people': email,
      ':owner': email
    },
    ExpressionAttributeNames: {
      "#s":"status"
    },
  };
  let promise = new Promise((resolve, reject) => {
    docClient.query(params).promise().then((data) => {
      //console.log('getCollections', data);
      resolve(data.Items);
    }).catch((err) => {
      reject(err);
    });
  });

  return promise;
}

export function updatePhoto(photoData) {
  const params = {
    TableName: CONFIG.DDBAssetsTable,
    Key: {
      imageID: photoData.imageID
    },
    UpdateExpression: "set fileName = :fileName, collectionID = :collectionID, collectionName = :collectionName, notes = :Notes, tags = :Tags, rating = :rating",
    ExpressionAttributeValues:{
        ":fileName": photoData.fileName,
        ":collectionID": photoData.collectionID,
        ":collectionName": photoData.collectionName,
        ":Notes": photoData.Notes,
        ":Tags": photoData.Tags,
        ":rating": photoData.rating
    },
    ReturnValues:"UPDATED_NEW"
  };
  //console.log(photoData);
  let promise = new Promise((resolve, reject) => {
    docClient.update(params).promise().then((data) => {
      //console.log('updatePhoto', data);
      resolve(data);
    }).catch((err) => {
      reject(err);
    });
  });

  return promise;

}

export function archiveCollection(collectionID) {
  const params = {
    TableName: CONFIG.DDBCollectionsTable,
    Key: {
      collectionID: collectionID
    },
    UpdateExpression: "set currentStatus = :r",
    ExpressionAttributeValues:{
        ":s":"archived",
    },
    ReturnValues:"UPDATED_NEW"
  };
  let promise = new Promise((resolve, reject) => {
    docClient.update(params).promise().then((data) => {
      //console.log('archiveCollection', data);
      resolve(data);
    }).catch((err) => {
      reject(err);
    });
  });

  return promise;

}

export function deleteCollection(collectionID) {
  const params = {
    TableName: CONFIG.DDBCollectionsTable,
    Key: {
      collectionID: collectionID
    }
  };
  let promise = new Promise((resolve, reject) => {
    docClient.delete(params).promise().then((data) => {
      //console.log('deleteCollection', data);
      resolve(data);
    }).catch((err) => {
      reject(err);
    });
  });

  return promise;

}

// Delete single photo by imageID
export function deletePhoto(imageID) {
  const params = {
    TableName: CONFIG.DDBAssetsTable,
    Key: {
      imageID: imageID.replace(/ /g, '+').replace('@', '%40')
    }
  };
  let promise = new Promise((resolve, reject) => {
    docClient.delete(params).promise().then((data) => {
      //console.log('deletePhoto', data);
      resolve(data);
    }).catch((err) => {
      reject(err);
    });
  });

  return promise;
}

// Delete all photos by collectionID
export function deletePhotosS3(collectionID) {
  const deleteParams = {
    TableName: CONFIG.DDBAssetsTable,
    Key: {
      collectionID: collectionID.replace(/ /g, '+').replace('@', '%40')
    }
  };

  let queryParams = {
    TableName: CONFIG.DDBAssetsTable,
    IndexName: 'collectionID-index',
    KeyConditionExpression: 'collectionID = :hkey',
    ExpressionAttributeValues: {
      ':hkey': collectionID
    }
  };

  docClient.query(queryParams, (error, rows) => {
    console.log('deletePhotos query: ', rows);
    
    // Spin up a bunch of delete requests
    return Promise.all(rows.Items.map((row) => {
      let params = { 
        Key: row.imageID.replace(/%2B/g,'+').replace(/%40/g, '@').replace(/%2520/g, ' '), 
        Bucket: CONFIG.S3DAMBucket
      };

      
      let promise = new Promise((resolve, reject) => {
        S3.deleteObject(params, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });

      return promise;
    }))
  });
}

export function deletePhotoS3(imageID) {
  
  let params = { 
    Key: imageID.replace(/%2B/g,'+').replace(/%40/g, '@'), 
    Bucket: CONFIG.S3DAMBucket
  };
  console.log('params', params)

  let promise = new Promise((resolve, reject) => {
    S3.deleteObject(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

  return promise;
}

// Delete all photos by collectionID
export function archivePhotos(collectionID) {
  const deleteParams = {
    TableName: CONFIG.DDBAssetsTable,
    Key: {
      collectionID: collectionID.replace(/ /g, '+')
    }
  };

  let queryParams = {
    TableName: CONFIG.DDBAssetsTable,
    IndexName: 'collectionID-index',
    KeyConditionExpression: 'collectionID = :hkey',
    ExpressionAttributeValues: {
      ':hkey': collectionID
    }
  };

  docClient.query(queryParams, (error, rows) => {
  //console.log('archivePhotos query: ', rows);
  // Spin up a bunch of delete requests
  return Promise.all(rows.Items.map((row) => docClient.update({
    TableName: CONFIG.DDBAssetsTable,
    Key: {
      imageID: row.imageID,
    },
    UpdateExpression: "set currentStatus = :currentStatus",
    ExpressionAttributeValues:{
      ':currentStatus': 'archive'
    },
    ReturnValues:"UPDATED_NEW"
  }).promise()))});
}

export function archivePhoto(imageID) {

  let promise = new Promise((resolve, reject) => {
    docClient.update({
      TableName: CONFIG.DDBAssetsTable,
      Key: {
        imageID: imageID,
      },
      UpdateExpression: "set currentStatus = :currentStatus",
      ExpressionAttributeValues:{
        ':currentStatus': 'archive'
      },
      ReturnValues:"UPDATED_NEW"
    }).promise().then((data) => {
      //console.log('archivePhoto', data);
      resolve(data);
    }).catch((err) => {
      reject(err);
    });
  });

  return promise;
}