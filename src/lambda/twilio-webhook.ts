import * as queryString from 'query-string';
import { twiml } from 'twilio';
import { TwilioRequestBody } from '../model/twilio-request-body';
import { AddWordleStatStrategy } from '../strategy/add-wordle-stat-strategy';
import { BaseStrategy } from '../strategy/base-strategy';
import { CurrentStatsStrategy } from '../strategy/current-stats-strategy';
import { LastWeekStatsStrategy } from '../strategy/last-week-stats-strategy';
import { RulesStrategy } from '../strategy/rules-strategy';

const strategies: BaseStrategy[] = [
    new AddWordleStatStrategy('Send your Wordle score.'),
    new CurrentStatsStrategy("Send 'CURRENT'."),
    new LastWeekStatsStrategy("Send 'LAST'."),
    new RulesStrategy("Send 'RULES'.")
];

exports.handler = async (event: any) => {
    console.log(JSON.stringify(event, null, 4));

    try {
        const method = event.httpMethod;

        if (method === 'POST' && event.path === '/twilio') {
            let twilioRes: any;
            const body: TwilioRequestBody = queryString.parse(
                event.body
            ) as any as TwilioRequestBody;
            console.log(JSON.stringify(body, null, 4));

            for (const strategy of strategies) {
                if (strategy.canProcess(body.Body)) {
                    twilioRes = await strategy.process(body);
                    break;
                }
            }

            if (!twilioRes) {
                twilioRes = createNoStrategyFitRes();
            }

            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'text/xml'
                },
                body: twilioRes.toString()
            };
        }

        // We only accept GET for now
        return {
            statusCode: 400,
            headers: {},
            body: 'We only accept POST /twilio'
        };
    } catch (error: any) {
        const body = error.stack || JSON.stringify(error, null, 2);
        return {
            statusCode: 400,
            headers: {},
            body: JSON.stringify(body)
        };
    }
};

function createNoStrategyFitRes() {
    const twilioRes = new twiml.MessagingResponse();

    let message = "Sorry, I'm not sure what you're trying to do, you can:\n";
    for (let i = 0; i < strategies.length; ++i) {
        const strategy = strategies[i];
        message += `\n${i + 1}. ${strategy.getInstructions()}`;
    }

    twilioRes.message(message);
    return twilioRes;
}
