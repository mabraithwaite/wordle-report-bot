import { TwilioRequestBody } from '../model/twilio-request-body';

export class TwilioMessageUtils {
    private static instance: TwilioMessageUtils;
    public static getInstance(): TwilioMessageUtils {
        if (!TwilioMessageUtils.instance) {
            TwilioMessageUtils.instance = new TwilioMessageUtils();
        }
        return TwilioMessageUtils.instance;
    }

    private constructor() {}

    public isMessageFromUS(requestBody: TwilioRequestBody): boolean {
        return this.resolveField(requestBody.FromCountry).toUpperCase() === 'US';
    }

    public resolveField(field: string): string {
        return (field || '').trim();
    }
}
