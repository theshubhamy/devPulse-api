import * as cdk from 'aws-cdk-lib';
import { DevPulseApiStack } from '../lib/dev_pulse-api-stack';
import * as dotenv from 'dotenv';

dotenv.config();

const app = new cdk.App();
new DevPulseApiStack(app, 'DevPulseApiStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  synthesizer: new cdk.DefaultStackSynthesizer({
    qualifier: 'devpulse',
  }),
});
