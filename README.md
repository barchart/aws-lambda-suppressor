# barchart/aws-lambda-suppressor

A JavaScript utility for tracking and suppressing duplicate AWS Lambda invocations.

## Operation

When AWS Lambda functions are invoked, they are passed and `event` object. The ```event``` may contain a unique identifier. If so, the ```DynamoLambdaValidator``` will attempt to create a DynamoDB record, using a _conditional_ write. If the write fails, we know this event has already been processed and the Lambda function's processing should stop.

### Usage

The ```DynamoLambdaValidator``` extends [```LambdaValidator```](https://github.com/barchart/barchart-common-node-js/blob/master/aws/lambda/LambdaValidator.js) -- a class in the [@barchart/common-node-js](https://github.com/barchart/common-node-js) library). This class can easily be used with the [```LambdaHelper```](https://github.com/barchart/common-node-js/blob/master/aws/lambda/LambdaHelper.js) class, by overriding the ```getValidator``` function.;
