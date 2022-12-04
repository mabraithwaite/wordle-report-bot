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
            const statsCollector = new StatsCollector(dynamoClient);
            const collection = await statsCollector.getWeekStatsByDay(DateTime.now(), body);
            return this.createTwilioRes(statsCollector.getFormattedStatsMessage('Current scores:', collection, false));
        } catch (e: any) {
            console.error(JSON.stringify(e, null, 4));
        }

        return this.createTwilioRes('Sorry, I failed trying to get the current stats.');
    }

    private createTwilioRes(message: string): any {
        const twilioRes = new twiml.MessagingResponse();
        twilioRes.message(message);
        return twilioRes;
    }
}
