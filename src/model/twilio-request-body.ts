export interface TwilioRequestBody {
    AccountSid: string;
    ApiVersion: string; // yyyy-mm-dd
    Body: string;
    From: string;
    FromCity: string;
    FromCountry: string;
    FromState: string;
    FromZip: string;
    MessageSid: string;
    MessagingServiceSid: string;
    NumMedia: string;
    NumSegments: string;
    ReferralNumMedia: string;
    SmsMessageSid: string;
    SmsSid: string;
    SmsStatus: string;
    To: string;
    ToCity: string;
    ToCountry: string;
    ToState: string;
    ToZip: string;
}
