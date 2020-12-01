# @barchart/aws-lambda-suppressor

[![AWS CodeBuild](https://codebuild.us-east-1.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoiQnhYblNFR25BSGFCbjUxZVBwWUhIQUFuSVJCcEkvN1BsYWlzUTZQZWhSM2F4RUsyN3pHZEpuQWZpTVAwd3RlRkpKMWQzQVU5RXYxb2hPaHloeGtGUEg4PSIsIml2UGFyYW1ldGVyU3BlYyI6ImdlTjU5Ujk5L1lyeXVLdTUiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=master)](https://github.com/barchart/aws-lambda-suppressor)

A *public* JavaScript package for tracking and suppressing duplicate invocations of [AWS Lambda Functions](https://aws.amazon.com/lambda/).

### Workflow

* Each time a Lambda Function is invoked, An ```event``` object is provided.
* A unique identifier can usually be extracted from the ```event``` object, depending on the event source.
* Given a unique identifier, the [```DynamoMessageValidator```](./lib/dynamo/DynamoMessageValidator.js) attempts to create a DynamoDB record using a _conditional_ write.
* An failed write attempt indicates another Lambda Function has processed the event (and the current function should abort).

### Usage

This package relies heavily on code from the [@barchart/common-node-js](https://github.com/barchart/common-node-js) library.

* First, create a [```LambdaEventValidator```](https://github.com/barchart/common-node-js/blob/master/aws/lambda/validators/LambdaEventValidator.js) and add a ```DynamoMessageValidator``` instance.
* Then, plug the [```LambdaEventValidator```](https://github.com/barchart/common-node-js/blob/master/aws/lambda/validators/LambdaEventValidator.js) into your [```LambdaHelper```](https://github.com/barchart/common-node-js/blob/master/aws/lambda/LambdaHelper.js) by overriding its ```getValidator``` function.

### License

This software is provided under the MIT license.
