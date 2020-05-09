# @barchart/aws-lambda-suppressor

[![AWS CodeBuild](https://codebuild.us-east-1.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoiQnhYblNFR25BSGFCbjUxZVBwWUhIQUFuSVJCcEkvN1BsYWlzUTZQZWhSM2F4RUsyN3pHZEpuQWZpTVAwd3RlRkpKMWQzQVU5RXYxb2hPaHloeGtGUEg4PSIsIml2UGFyYW1ldGVyU3BlYyI6ImdlTjU5Ujk5L1lyeXVLdTUiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=master)](https://github.com/barchart/aws-lambda-suppressor)

A *public* JavaScript utility for tracking and suppressing duplicate AWS Lambda invocations.

## Operation

When a [Lambda function at AWS](https://aws.amazon.com/lambda/) is invoked, it's passed an `event` object. The ```event``` may contain a unique identifier.

If a unique identifier can be determined, the [```DynamoLambdaValidator```](https://github.com/barchart/aws-lambda-suppressor/blob/master/lib/dynamo/DynamoLambdaValidator.js) will attempt to create a record in a DynamoDB table, using a _conditional_ write. If the write fails, we know this event has already been processed and the Lambda function's processing should stop.

## Usage

The ```DynamoLambdaValidator``` extends [```LambdaValidator```](https://github.com/barchart/barchart-common-node-js/blob/master/aws/lambda/LambdaValidator.js) -- a class from the [@barchart/common-node-js](https://github.com/barchart/common-node-js) library.

As a result, the ```DynamoLambdaValidator``` can be plugged into a [```LambdaHelper```](https://github.com/barchart/common-node-js/blob/master/aws/lambda/LambdaHelper.js) by overriding its ```getValidator``` function.
