import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class DevPulseApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda function
    const honoLambda = new lambdaNodejs.NodejsFunction(this, 'HonoLambda', {
      entry: 'src/index.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X, // Change to your preferred Node runtime
      environment: {
        // Provide placeholder MONGO_URI, since secrets shouldn't be hardcoded here
        MONGODB_URI: process.env.MONGODB_URI || '',
      },
      timeout: cdk.Duration.seconds(30),
      bundling: {
        externalModules: ['aws-sdk'], // AWS SDK is provided by Lambda runtime
      },
    });

    // Provide a Function URL (HTTPS endpoint) to the Lambda
    const functionUrl = honoLambda.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE, // Make it accessible over internet
      cors: {
        allowedOrigins: ['*'], // Adjust for prod
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
