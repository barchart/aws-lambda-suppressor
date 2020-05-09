# @barchart/aws-lambda-suppressor

A JavaScript utility for tracking and suppressing duplicate AWS Lambda invocations.

## Operation

When an AWS Lambda functions is invoked, it's passed an `event` object. The ```event``` may contain a unique identifier.

If the event has a unique identifier, the ```DynamoLambdaValidator``` will attempt to create a record in a DynamoDB table, using a _conditional_ write. If the write fails, we know this event has already been processed and the Lambda function's processing should stop.

### Usage

The [```DynamoLambdaValidator```](https://github.com/barchart/aws-lambda-suppressor/blob/master/lib/dynamo/DynamoLambdaValidator.js) extends [```LambdaValidator```](https://github.com/barchart/barchart-common-node-js/blob/master/aws/lambda/LambdaValidator.js) -- a class from the [@barchart/common-node-js](https://github.com/barchart/common-node-js) library.

As a result, the ```DynamoLambdaValidator``` can be plugged into the [```LambdaHelper```](https://github.com/barchart/common-node-js/blob/master/aws/lambda/LambdaHelper.js), by overriding its ```getValidator``` function.
