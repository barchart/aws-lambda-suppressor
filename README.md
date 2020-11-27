# @barchart/aws-lambda-suppressor

[![AWS CodeBuild](https://codebuild.us-east-1.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoiQnhYblNFR25BSGFCbjUxZVBwWUhIQUFuSVJCcEkvN1BsYWlzUTZQZWhSM2F4RUsyN3pHZEpuQWZpTVAwd3RlRkpKMWQzQVU5RXYxb2hPaHloeGtGUEg4PSIsIml2UGFyYW1ldGVyU3BlYyI6ImdlTjU5Ujk5L1lyeXVLdTUiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=master)](https://github.com/barchart/aws-lambda-suppressor)

A *public* JavaScript package for tracking and suppressing duplicate invocations of [AWS Lambda Functions](https://aws.amazon.com/lambda/).

### Overview

When a Lambda Function is invoked, it's passed an ```event``` object. If a unique identifier can be extracted from the ```event``` object, the [```DynamoLambdaValidator```](./lib/dynamo/DynamoLambdaValidator.js) will attempt to create a record in DynamoDB, using a _conditional_ write. If the write fails, we know another Lambda Function has already processed this event and the current Lambda Function should abort its processing.

### Usage

This package relies heavily on code from the [@barchart/common-node-js](https://github.com/barchart/common-node-js) library.

* ```DynamoLambdaValidator``` extends [```LambdaValidator```](https://github.com/barchart/barchart-common-node-js/blob/master/aws/lambda/LambdaValidator.js).
* ```DynamoLambdaValidator``` can be plugged into a [```LambdaHelper```](https://github.com/barchart/common-node-js/blob/master/aws/lambda/LambdaHelper.js) by overriding its ```getValidator``` function.

### License

This software is provided under the MIT license.
