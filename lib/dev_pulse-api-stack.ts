import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as event_sources from 'aws-cdk-lib/aws-lambda-event-sources';

export class DevPulseApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. SQS Queue for Metrics Aggregation
    const metricsQueue = new sqs.Queue(this, 'MetricsQueue', {
      visibilityTimeout: cdk.Duration.seconds(45), // Should be > Lambda timeout
    });

    // 2. Main Lambda function (API + SQS Worker)
    const honoLambda = new lambdaNodejs.NodejsFunction(this, 'HonoLambda', {
      entry: 'src/index.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        MONGODB_URI: process.env.MONGODB_URI || '',
        JWT_SECRET: process.env.JWT_SECRET || '',
        METRICS_QUEUE_URL: metricsQueue.queueUrl,
      },
      timeout: cdk.Duration.seconds(30),
      bundling: {
        externalModules: ['aws-sdk'],
      },
    });

    // 3. Grant Permissions
    metricsQueue.grantSendMessages(honoLambda);
    metricsQueue.grantConsumeMessages(honoLambda);

    // 4. Add SQS as an event source (This triggers the Lambda when a message arrives)
    honoLambda.addEventSource(new event_sources.SqsEventSource(metricsQueue));

    // Provide a Function URL (HTTPS endpoint) to the Lambda
    const functionUrl = honoLambda.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ['*'],
        allowedMethods: [lambda.HttpMethod.ALL],
        allowedHeaders: ['*'],
      },
    });

    // Output the url
    new cdk.CfnOutput(this, 'HttpApiUrl', {
      value: functionUrl.url,
      description: 'The URL of the Hono API',
    });
  }
}
