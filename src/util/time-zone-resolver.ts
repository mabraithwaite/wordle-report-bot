import * as cityToTimeZone from 'city-timezones';
import { countBy, entries, filter, max, groupBy, keys, values } from 'lodash';
import * as zipcodeToTimeZone from 'zipcode-to-timezone';
import { TwilioRequestBody } from '../model/twilio-request-body';
import { TwilioMessageUtils } from './twilio-message-utils';

export class TimeZoneResolver {
    private static instance: TimeZoneResolver;
    public static getInstance(): TimeZoneResolver {
        if (!TimeZoneResolver.instance) {
            TimeZoneResolver.instance = new TimeZoneResolver();
        }
        return TimeZoneResolver.instance;
    }

    private twilioMessageUtils = TwilioMessageUtils.getInstance();

    private constructor() {}

    public getTimeZone(requestBody: TwilioRequestBody): string | undefined {
        return (
            this.getTimeZoneFromZip(requestBody) ||
            this.getTimeZoneFromCity(requestBody) ||
            this.getTimeZoneFromState(requestBody)
        );
    }

    public getTimeZoneFromZip(requestBody: TwilioRequestBody): string | undefined {
        return (
            (this.twilioMessageUtils.isMessageFromUS(requestBody) &&
                requestBody.FromZip &&
                zipcodeToTimeZone.lookup(requestBody.FromZip.trim())) ||
            undefined
        );
    }

    public getTimeZoneFromCity(requestBody: TwilioRequestBody): string | undefined {
        if (!this.twilioMessageUtils.isMessageFromUS(requestBody)) return undefined;

        const state = this.twilioMessageUtils.resolveField(requestBody.FromState);
        if (!state) return undefined;

        const city = this.twilioMessageUtils.resolveField(requestBody.FromCity);
        const cityData =
            (city && cityToTimeZone.lookupViaCity(city).find((cityData) => cityData.state_ansi === state)) || undefined;
        return cityData?.timezone || undefined;
    }

    public getTimeZoneFromState(requestBody: TwilioRequestBody): string | undefined {
        if (!this.twilioMessageUtils.isMessageFromUS(requestBody)) return undefined;

        const state = this.twilioMessageUtils.resolveField(requestBody.FromState);
        if (!state) return undefined;

        const stateTimeZoneToCountEntries = entries(
            countBy(filter(cityToTimeZone.cityMapping, { state_ansi: state }), 'timezone')
        );
        if (!stateTimeZoneToCountEntries.length) return undefined;
        if (stateTimeZoneToCountEntries.length === 1) return stateTimeZoneToCountEntries[0][0];

        const maxTimeZoneCount = max(stateTimeZoneToCountEntries.map((entry) => entry[1]));
        const timeZonesWithMax = stateTimeZoneToCountEntries
            .filter((entry) => entry[1] === maxTimeZoneCount)
            .map((entry) => entry[0])
            .sort();
        return timeZonesWithMax[0];
    }
}
