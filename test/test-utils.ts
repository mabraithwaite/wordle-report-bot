import { TwilioRequestBody } from '../src/model/twilio-request-body';

export function createBuildTwilioRequestMessageFunction(
    defaults?: Partial<TwilioRequestBody>
): (requestBody?: Partial<TwilioRequestBody>) => TwilioRequestBody {
    return (requestBody?: Partial<TwilioRequestBody>) => ({
        AccountSid: 'TEST_ACCOUNT_SID',
        ApiVersion: '2010-04-01',
        Body: 'TEST_BODY',
        From: 'TEST_FROM',
        FromCity: 'TEST_FROM_CITY',
        FromCountry: 'TEST_FROM_COUNTRY',
        FromState: 'TEST_FROM_STATE',
        FromZip: 'TEST_FROM_ZIP',
        MessageSid: 'TEST_MESSAGE_SID',
        MessagingServiceSid: 'TEST_MESSAGING_SERVICE_SID',
        NumMedia: 'TEST_NUM_MEDIA',
        NumSegments: 'TEST_NUM_SEGMENTS',
        ReferralNumMedia: 'TEST_REFERRAL_NUM_MEDIA',
        SmsMessageSid: 'TEST_SMS_MESSAGE_SID',
        SmsSid: 'TEST_SMS_SID',
        SmsStatus: 'TEST_SMS_STATUS',
        To: 'TEST_TO',
        ToCity: 'TEST_TO_CITY',
        ToCountry: 'TEST_TO_COUNTRY',
        ToState: 'TEST_TO_STATE',
        ToZip: 'TEST_TO_ZIP',
        ...defaults,
        ...requestBody
    });
}
