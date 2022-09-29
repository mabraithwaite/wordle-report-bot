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
            const statsCollector = new StatsCollector(dynamoClient);
            const collection = await statsCollector.getWeekStatsByDay(
                DateTime.now().minus({ week: 1 }),
                body.FromZip
            );
            return this.createTwilioRes(
                statsCollector.getFormattedStatsMessage("Last week's scores:", collection, true)
            );
        } catch (e: any) {
            console.error(JSON.stringify(e, null, 4));
        }

        return this.createTwilioRes("Sorry, I failed trying to get last week's stats.");
    }

    private createTwilioRes(message: string): any {
        const twilioRes = new twiml.MessagingResponse();
        twilioRes.message(message);
        return twilioRes;
    }
}
