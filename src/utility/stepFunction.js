import {CONFIG} from './config'
import AWS from 'aws-sdk'

export function checkExecutionStatus(arn) {

  AWS.config.region = CONFIG.Region;
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({IdentityPoolId: CONFIG.CognitoIdentityPool});
  let lambdaClient = new AWS.Lambda({
    region: CONFIG.Region
  });

  const lambdaInputPayload = JSON.stringify({executionArn: arn});
  const params = {
    FunctionName: CONFIG.DescribeExecutionLambda,
    Payload: lambdaInputPayload
  };

  let promise = new Promise((resolve, reject) => {
    lambdaClient.invoke(params).promise().then((data) => {
      const payload = JSON.parse(data.Payload);
      resolve(payload.status);
    }).catch((err) => {
      reject(err);
    });
  });
  return promise;
  
}
