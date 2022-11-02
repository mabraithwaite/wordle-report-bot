import { twiml } from 'twilio';
import { TwilioRequestBody } from '../model/twilio-request-body';
import { BaseStrategy } from './base-strategy';

const RULES_REGEX = /rules/im;

export class RulesStrategy extends BaseStrategy {
    public canProcess(body: string): boolean {
        return RULES_REGEX.test(body);
    }

    public async process(body: TwilioRequestBody): Promise<any> {
        return this.createNewSubmissionRes();
    }

    private createNewSubmissionRes(): any {
        const twilioRes = new twiml.MessagingResponse();
        twilioRes.message(
            `RULES:\n\nEvery day, send your score to me directly from the wordle site. I'll remember everyone's score and you can check your weekly tally to see who's in the lead. Current point system:\n\n1. Whatever guess out of 6 is that days score\n2. If you fail to solve a day (ie get X/6) your score for that day is 7\n3. If you miss a day (ie don't submit a score) your score for that day is 8\n\nLowest score wins for the week. Good luck 👑!`
        );
        return twilioRes;
    }
}
