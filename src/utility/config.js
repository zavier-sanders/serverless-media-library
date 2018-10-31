"use strict";

// Replace these for your AWS environment

export const CONFIG = {
    DDBCollectionsTable: "photo-sharing-backend-AlbumMetadataDDBTable-N0BZL61X8SV3",
    DDBUserTable: 'rocketpic-users',
    CognitoIdentityPool: "us-west-2:627400bf-3974-439b-a035-c628fb2e4cb6",
    Region: "us-west-2",
    DDBAssetsTable: "photo-sharing-backend-ImageMetadataDDBTable-17KKUA11Q5KVM",
    S3DAMBucket: "photo-sharing-backend-photorepos3bucket-19pxri1qd0s3m",
    DescribeExecutionLambda: "photo-sharing-backend-DescribeExecutionFunction-XS7P2NVUUJ3Y",
    searchkit: "https://search-media-library-xjz5wt6lrdgv7gyuyaxrij2n4i.us-west-2.es.amazonaws.com/photos/",
    supportEmail: 'support@rocketpic.com',
};