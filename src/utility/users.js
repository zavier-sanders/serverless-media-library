import {CONFIG} from './config'
import AWS from 'aws-sdk'

AWS.config.region = CONFIG.Region;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({IdentityPoolId: CONFIG.CognitoIdentityPool});
let docClient = new AWS.DynamoDB.DocumentClient({
  region: CONFIG.Region
});

export function getUserInfo(email) {
  const params = {
    TableName: CONFIG.DDBUserTable,
    Key: {
      email: email
    }
  };
  let promise = new Promise((resolve, reject) => {
    docClient.get(params).promise().then((data) => {
      resolve(data.Item);
    }).catch((err) => {
      reject(err);
    });
  });

  return promise;
}

export function getUsers() {
  const params = {
    TableName: CONFIG.DDBUserTable,
    IndexName: 'currentStatus-index',
    KeyConditionExpression: 'currentStatus = :currentStatus',
    ExpressionAttributeValues: {
      ':currentStatus': 'active',
    }
  };
  let promise = new Promise((resolve, reject) => {
    docClient.query(params).promise().then((data) => {
      //console.log('getInfo', data);
      resolve(data);
    }).catch((err) => {
      reject(err);
    });
  });

  return promise;
}

export function createUser(userData) {
  let params = {
      TableName: CONFIG.DDBUserTable,
      Item:{
          "email": userData.email,
          "firstName": userData.firstName,
          "lastName": userData.lastName,
          "username": userData.username,
          "role": userData.role,
          "picture": "https://api.adorable.io/avatars/250/" + userData.email + ".png",
          "created": Math.floor(new Date().getTime() / 1000),
          "currentStatus": userData.status,
      }
  };

  let promise = new Promise((resolve, reject) => {
    docClient.put(params).promise().then((data) => {
      // console.log('createUser', data);
      resolve(data.Item);
    }).catch((err) => {
      reject(err);
    });
  });

  return promise;
}

export function updateUserStatus(userData) {
  const params = {
    TableName: CONFIG.DDBUserTable,
    Key: {
      email: userData.email
    },
    UpdateExpression: "set currentStatus = :currentStatus",
    ExpressionAttributeValues:{
        ":currentStatus": userData.status,
    },
    ReturnValues:"UPDATED_NEW"
  };
  
  let promise = new Promise((resolve, reject) => {
    docClient.update(params).promise().then((data) => {
      // console.log('updateUserStatus', data);
      resolve(data);
    }).catch((err) => {
      reject(err);
    });
  });

  return promise;

}

export function updateOnlyUserStatus(userData) {
  const params = {
    TableName: CONFIG.DDBUserTable,
    Key: {
      email: userData.email
    },
    UpdateExpression: "set currentStatus = :currentStatus",
    ExpressionAttributeValues:{
        ":currentStatus": userData.status,
    },
    ReturnValues:"UPDATED_NEW"
  };
  
  let promise = new Promise((resolve, reject) => {
    docClient.update(params).promise().then((data) => {
      // console.log('updateUserStatus', data);
      resolve(data);
    }).catch((err) => {
      reject(err);
    });
  });

  return promise;

}

export function updateUserData(userData) {
  const params = {
    TableName: CONFIG.DDBUserTable,
    Key: {
      email: userData.email
    },
    UpdateExpression: "set firstName = :firstName, lastName = :lastName, username = :username, picture = :picture, #r = :role",
    ExpressionAttributeValues:{
        ":firstName": userData.firstName,
        ":lastName": userData.lastName,
        ":username": userData.username,
        ":picture": userData.picture,
        ":role": 'admin'//userData.role,
    },
    ExpressionAttributeNames: {
      "#r":"role"
    },
    ReturnValues:"UPDATED_NEW"
  };
  
  let promise = new Promise((resolve, reject) => {
    docClient.update(params).promise().then((data) => {
      // console.log('updateUserStatus', data);
      resolve(data);
    }).catch((err) => {
      reject(err);
    });
  });

  return promise;

}