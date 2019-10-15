# barchart/aws-lambda-suppressor
## Utility for tracking and suppressing duplicate AWS Lambda invocations

## Overview

The `DynamoLambdaValidator` inherits `LambdaValidator` (a class in the [@barchart/common-node-js](https://github.com/barchart/barchart-common-node-js/blob/master/aws/lambda/LambdaValidator.js) library).

## Operation

Each time a Lambda function is invoked, a record keyed by the invoking event's identifier is written to a DyanmoDB table (using a conditional write). If the write fails, we know this event has already been processed and the Lambda function's processing should stop.
