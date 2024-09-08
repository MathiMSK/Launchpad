import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: 'AKIAW3MECST5BFV6KUWU',
  secretAccessKey: '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',
  region: 'ap-south-1'
});

const s3 = new AWS.S3();
export default s3;
