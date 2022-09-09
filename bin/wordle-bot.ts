#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import 'source-map-support/register';
import { SharedInfraStack } from '../lib/shared-infra-stack';
import { WordleBotStack } from '../lib/wordle-bot-stack';

const app = new App();
const infra = new SharedInfraStack(app, 'SharedInfraStack', {});
new WordleBotStack(app, 'WordleBotStack', {
    userTable: infra.userTable,
    wordleStatsTable: infra.wordleStatsTable
});
