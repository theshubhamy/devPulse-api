import * as cdk from 'aws-cdk-lib';
import { DevPulseApiStack } from '../lib/dev_pulse-api-stack';

const app = new cdk.App();
new DevPulseApiStack(app, 'DevPulseApiStack', {
  env: { account: '913524914406', region: 'ap-south-1' },
  synthesizer: new cdk.DefaultStackSynthesizer({
    qualifier: 'devpulse',
  }),
});
