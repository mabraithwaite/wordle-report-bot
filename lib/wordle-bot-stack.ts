import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { USER_TABLE_NAME_KEY, WORDLE_STATS_TABLE_NAME_KEY } from '../constants/table-names';

interface WordleBotStackProps extends StackProps {
    userTable: Table;
    wordleStatsTable: Table;
}

export class WordleBotStack extends Stack {
    constructor(scope: Construct, id: string, props: WordleBotStackProps) {
        super(scope, id, props);

        const twilioWebhook = this.createTwilioWebhookLambda(props);
        const twilioFailureWebhook = this.createTwilioFailureWebhookLambda();

        const api = new RestApi(this, 'twilio-api', {
            restApiName: 'Twilio Webhook',
            description: 'Acts as a callback to Twilio webhook calls.'
        });
        const postWebhookIntegration = new LambdaIntegration(twilioWebhook, {
            requestTemplates: { 'application/json': '{ "statusCode": "200" }' }
        });
        const postFailureWebhookIntegration = new LambdaIntegration(twilioFailureWebhook, {
            requestTemplates: { 'application/json': '{ "statusCode": "200" }' }
        });

        const main = api.root.addResource('twilio');
        const failure = api.root.addResource('failure');
        main.addMethod('POST', postWebhookIntegration); // POST /twilio
        failure.addMethod('POST', postFailureWebhookIntegration); // POST /failure
    }

    private createTwilioWebhookLambda(props: WordleBotStackProps): NodejsFunction {
        const lambda = new NodejsFunction(this, 'twilio-webhook-lambda', {
            entry: 'src/lambda/twilio-webhook.ts',
            timeout: Duration.seconds(60 * 15),
            environment: {
                [USER_TABLE_NAME_KEY]: props.userTable.tableName,
                [WORDLE_STATS_TABLE_NAME_KEY]: props.wordleStatsTable.tableName
            }
        });

        props.userTable.grantReadData(lambda);
        props.wordleStatsTable.grantReadWriteData(lambda);

        return lambda;
    }

    private createTwilioFailureWebhookLambda(): NodejsFunction {
        const lambda = new NodejsFunction(this, 'twilio-failure-webhook-lambda', {
            entry: 'src/lambda/twilio-failure-webhook.ts',
            timeout: Duration.seconds(120)
        });

        return lambda;
    }
}
