import { TwilioRequestBody } from '../model/twilio-request-body';

export abstract class BaseStrategy {
    constructor(private instructions: string) {}

    public getInstructions(): string {
        return this.instructions;
    }

    abstract canProcess(textMessage: string): boolean;

    abstract process(body: TwilioRequestBody): Promise<any>;
}
