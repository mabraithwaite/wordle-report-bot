import { entries } from 'lodash-es';
import { DateTime } from 'luxon';
import { twiml } from 'twilio';
import { TwilioRequestBody } from '../model/twilio-request-body';
import { DynamoDbClientFactory } from '../util/aws/dynamodb-client-factory';
import { StatsCollector } from '../util/stats-collector';
import { BaseStrategy } from './base-strategy';

const LAST_WEEK_REGEX = /last/im;

export class LastWeekStatsStrategy extends BaseStrategy {
    public canProcess(body: string): boolean {
        return LAST_WEEK_REGEX.test(body);
    }

    public async process(body: TwilioRequestBody): Promise<any> {
        try {
            const dynamoClient = DynamoDbClientFactory.getDynamoDbDocumentClient();
            const { phoneToScoreMap, phoneToNameMap } = await new StatsCollector(
                dynamoClient
            ).getWeekStatsByDay(DateTime.now().minus({ week: 1 }));
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
        let message = "Last week's scores:";
        for (let i = 0; i < scoreEntries.length; ++i) {
            const entry = scoreEntries[i];
            message += `\n${this.getMedal(i)}${phoneToNameMap[entry[0]]}: ${entry[1]}`;
        }

        twilioRes.message(message);
        return twilioRes;
    }

    private getMedal(index: number): string {
        switch (index) {
            case 0:
                return '🥇 ';
            case 1:
                return '🥈 ';
            case 2:
                return '🥉 ';
            default:
                return '  ';
        }
    }

    private createFailureRes(): any {
        const twilioRes = new twiml.MessagingResponse();
        twilioRes.message(`Sorry, I failed trying to get last week's stats.`);
        return twilioRes;
    }
}
