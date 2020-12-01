# @barchart/aws-lambda-suppressor

[![AWS CodeBuild](https://codebuild.us-east-1.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoiQnhYblNFR25BSGFCbjUxZVBwWUhIQUFuSVJCcEkvN1BsYWlzUTZQZWhSM2F4RUsyN3pHZEpuQWZpTVAwd3RlRkpKMWQzQVU5RXYxb2hPaHloeGtGUEg4PSIsIml2UGFyYW1ldGVyU3BlYyI6ImdlTjU5Ujk5L1lyeXVLdTUiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=master)](https://github.com/barchart/aws-lambda-suppressor)

A *public* JavaScript package for tracking and suppressing duplicate invocations of [AWS Lambda Functions](https://aws.amazon.com/lambda/).

### Workflow

* An ```event``` object is passed to user code each time a Lambda Function is invoked.
* In most cases, a unique identifier can be extracted from the ```event``` object.
* If a unique identifier can be determined, the the [```DynamoMessageValidator```](./lib/dynamo/DynamoMessageValidator.js) will attempt to create a record in DynamoDB, using a _conditional_ write.
* If the conditional write fails, we know another Lambda Function has already processed this event (and current processing should abort).

### Usage

This package relies heavily on code from the [@barchart/common-node-js](https://github.com/barchart/common-node-js) library.

* First, create a [```LambdaEventValidator```](https://github.com/barchart/common-node-js/blob/master/aws/lambda/validators/LambdaEventValidator.js) and add a ```DynamoMessageValidator``` instance.
* Then, plug the [```LambdaEventValidator```](https://github.com/barchart/common-node-js/blob/master/aws/lambda/validators/LambdaEventValidator.js) into your [```LambdaHelper```](https://github.com/barchart/common-node-js/blob/master/aws/lambda/LambdaHelper.js) by overriding its ```getValidator``` function.

### License

This software is provided under the MIT license.
