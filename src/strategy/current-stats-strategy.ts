import { entries } from 'lodash-es';
import { DateTime } from 'luxon';
import { twiml } from 'twilio';
import { TwilioRequestBody } from '../model/twilio-request-body';
import { DynamoDbClientFactory } from '../util/aws/dynamodb-client-factory';
import { StatsCollector } from '../util/stats-collector';
import { BaseStrategy } from './base-strategy';

const CURRENT_REGEX = /current/im;

export class CurrentStatsStrategy extends BaseStrategy {
    public canProcess(body: string): boolean {
        return CURRENT_REGEX.test(body);
    }

    public async process(body: TwilioRequestBody): Promise<any> {
        try {
            const dynamoClient = DynamoDbClientFactory.getDynamoDbDocumentClient();
            const { phoneToScoreMap, phoneToNameMap } = await new StatsCollector(
                dynamoClient
            ).getWeekStatsByDay(DateTime.now(), body.FromZip);
            return this.createSuccessRes(phoneToScoreMap, phoneToNameMap);
        } catch (e: any) {
            console.error(JSON.stringify(e, null, 4));
        }

        return this.createFailureRes();
    }

    private createSuccessRes(
        phoneToScoreMap: { [key: string]: number },
        phoneToNameMap: { [key: string]: string }
    ): any {
        const twilioRes = new twiml.MessagingResponse();

        const scoreEntries = entries(phoneToScoreMap).sort((a, b) => a[1] - b[1]);
        let message = 'Current scores:';
        for (let i = 0; i < scoreEntries.length; ++i) {
            const entry = scoreEntries[i];
            message += `\n   ${phoneToNameMap[entry[0]]}: ${entry[1]}`;
        }

        twilioRes.message(message);
        return twilioRes;
    }

    private createFailureRes(): any {
        const twilioRes = new twiml.MessagingResponse();
        twilioRes.message(`Sorry, I failed trying to get the current stats.`);
        return twilioRes;
    }
}
