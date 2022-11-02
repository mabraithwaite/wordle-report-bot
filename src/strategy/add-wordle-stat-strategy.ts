import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { twiml } from 'twilio';
import { WORDLE_STATS_TABLE_NAME_KEY } from '../../constants/table-names';
import { TwilioRequestBody } from '../model/twilio-request-body';
import { WordleStat } from '../model/wordle-stat';
import { DynamoDbClientFactory } from '../util/aws/dynamodb-client-factory';
import { EnvironmentVariableUtil } from '../util/env/environment-variable-util';
import { BaseStrategy } from './base-strategy';

const WORDLE_REGEX = /Wordle (\d+) (.+)\/6/m;

export class AddWordleStatStrategy extends BaseStrategy {
    public canProcess(body: string): boolean {
        return WORDLE_REGEX.test(body);
    }

    public async process(body: TwilioRequestBody): Promise<any> {
        const matcher = (body.Body as string).match(WORDLE_REGEX);
        if (matcher?.length === 3) {
            const wordleId = +matcher[1].trim();
            const scoreVal = this.getScoreValue(matcher[2].trim());
            if (wordleId && scoreVal) {
                const dynamoClient = DynamoDbClientFactory.getDynamoDbDocumentClient();

                await dynamoClient.send(
                    new PutCommand({
                        TableName: EnvironmentVariableUtil.getVariableOrThrow(
                            WORDLE_STATS_TABLE_NAME_KEY
                        ),
                        Item: {
                            phoneNumber: body.From,
                            wordleId,
                            score: scoreVal
                        } as WordleStat
                    })
                );

                return this.createNewSubmissionRes(wordleId, scoreVal);
            } else {
                console.log(`wordleId: ${wordleId}\tscoreVal${scoreVal}`);
            }
        }
        return this.createFailureSubmissionRes();
    }

    private getScoreValue(score: string): number {
        return isNaN(+score) ? 7 : +score;
    }

    private createNewSubmissionRes(wordleId: number, score: number): any {
        const twilioRes = new twiml.MessagingResponse();
        twilioRes.message(`Successfully added your score of ${score} for Wordle ${wordleId}`);
        return twilioRes;
    }

    private createFailureSubmissionRes(): any {
        const twilioRes = new twiml.MessagingResponse();
        twilioRes.message(`Sorry, I failed to parse your Wordle submission.`);
        return twilioRes;
    }
}
