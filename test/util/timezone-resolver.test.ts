import { TimeZoneResolver } from '../../src/util/time-zone-resolver';
import { createBuildTwilioRequestMessageFunction } from '../test-utils';

const TIMEZONE_NY = 'America/New_York';
const TIMEZONE_CHI = 'America/Chicago';
const TIMEZONE_LA = 'America/Los_Angeles';
const TIMEZONE_DEN = 'America/Denver';
const TIMEZONE_NE_1 = TIMEZONE_CHI;
const TIMEZONE_NE_2 = TIMEZONE_DEN;

const ZIP_NY = '10001';
const ZIP_CHI = '60007';
const ZIP_LA = '98101';
const ZIP_NE_1 = '68845';
const ZIP_NE_2 = '69301';

const CITY_NY = 'New York';
const CITY_CHI = 'Chicago';
const CITY_LA = 'Los Angeles';
const CITY_NE_1 = 'Kearney';
const CITY_NE_2 = 'Alliance';

const STATE_NY = 'NY';
const STATE_CHI = 'IL';
const STATE_LA = 'CA';
const STATE_NE = 'NE';

const COUNTRY_US = 'US';
const COUNTRY_CN = 'CN';

describe('TimeZoneResolver', () => {
    let timeZoneResolver: TimeZoneResolver;

    beforeEach(() => {
        timeZoneResolver = TimeZoneResolver.getInstance();
    });

    describe('getTimeZoneFromZip', () => {
        it('will be `undefined` if country is not `US`', () => {
            expect(
                timeZoneResolver.getTimeZoneFromZip(buildTwilioMessage({ FromCountry: undefined, FromZip: ZIP_NY }))
            ).toBeUndefined();
            expect(
                timeZoneResolver.getTimeZoneFromZip(buildTwilioMessage({ FromCountry: '', FromZip: ZIP_NY }))
            ).toBeUndefined();
            expect(
                timeZoneResolver.getTimeZoneFromZip(buildTwilioMessage({ FromCountry: COUNTRY_CN, FromZip: ZIP_NY }))
            ).toBeUndefined();
        });

        it('will be `undefined` if the zip code is not provided', () => {
            expect(timeZoneResolver.getTimeZoneFromZip(buildTwilioMessage({ FromZip: undefined }))).toBeUndefined();
        });

        it('will be `undefined` if invalid zip code is provided', () => {
            expect(timeZoneResolver.getTimeZoneFromZip(buildTwilioMessage({ FromZip: '' }))).toBeUndefined();
            expect(timeZoneResolver.getTimeZoneFromZip(buildTwilioMessage({ FromZip: '098' }))).toBeUndefined();
        });

        it('will be find the time zone if the zip code is provided', () => {
            expect(timeZoneResolver.getTimeZoneFromZip(buildTwilioMessage({ FromZip: ZIP_NY }))).toBe(TIMEZONE_NY);
        });

        it('will be opt to use zip code if different city and/or state is provided', () => {
            expect(
                timeZoneResolver.getTimeZoneFromZip(buildTwilioMessage({ FromCity: CITY_NY, FromZip: ZIP_CHI }))
            ).toBe(TIMEZONE_CHI);
            expect(
                timeZoneResolver.getTimeZoneFromZip(
                    buildTwilioMessage({ FromCity: CITY_NY, FromState: STATE_CHI, FromZip: ZIP_LA })
                )
            ).toBe(TIMEZONE_LA);
        });
    });

    describe('getTimeZoneFromCity', () => {
        it('will be `undefined` if country is not `US`', () => {
            expect(
                timeZoneResolver.getTimeZoneFromCity(
                    buildTwilioMessage({ FromCountry: undefined, FromCity: CITY_CHI, FromState: CITY_CHI })
                )
            ).toBeUndefined();
            expect(
                timeZoneResolver.getTimeZoneFromCity(
                    buildTwilioMessage({ FromCountry: '', FromCity: CITY_CHI, FromState: CITY_CHI })
                )
            ).toBeUndefined();
            expect(
                timeZoneResolver.getTimeZoneFromCity(
                    buildTwilioMessage({ FromCountry: COUNTRY_CN, FromCity: CITY_CHI, FromState: CITY_CHI })
                )
            ).toBeUndefined();
        });

        it('will be `undefined` if state is not provided', () => {
            expect(
                timeZoneResolver.getTimeZoneFromCity(buildTwilioMessage({ FromState: undefined, FromCity: CITY_NY }))
            ).toBeUndefined();
            expect(
                timeZoneResolver.getTimeZoneFromCity(buildTwilioMessage({ FromState: undefined, FromCity: CITY_CHI }))
            ).toBeUndefined();
            expect(
                timeZoneResolver.getTimeZoneFromCity(buildTwilioMessage({ FromState: undefined, FromCity: CITY_LA }))
            ).toBeUndefined();

            expect(
                timeZoneResolver.getTimeZoneFromCity(buildTwilioMessage({ FromState: '', FromCity: CITY_NY }))
            ).toBeUndefined();
            expect(
                timeZoneResolver.getTimeZoneFromCity(buildTwilioMessage({ FromState: '', FromCity: CITY_CHI }))
            ).toBeUndefined();
            expect(
                timeZoneResolver.getTimeZoneFromCity(buildTwilioMessage({ FromState: '', FromCity: CITY_LA }))
            ).toBeUndefined();
        });

        it('will be `undefined` if city is not provided', () => {
            expect(
                timeZoneResolver.getTimeZoneFromCity(buildTwilioMessage({ FromState: STATE_NY, FromCity: undefined }))
            ).toBeUndefined();
            expect(
                timeZoneResolver.getTimeZoneFromCity(buildTwilioMessage({ FromState: STATE_CHI, FromCity: undefined }))
            ).toBeUndefined();
            expect(
                timeZoneResolver.getTimeZoneFromCity(buildTwilioMessage({ FromState: STATE_LA, FromCity: undefined }))
            ).toBeUndefined();

            expect(
                timeZoneResolver.getTimeZoneFromCity(buildTwilioMessage({ FromState: STATE_NY, FromCity: '' }))
            ).toBeUndefined();
            expect(
                timeZoneResolver.getTimeZoneFromCity(buildTwilioMessage({ FromState: STATE_CHI, FromCity: '' }))
            ).toBeUndefined();
            expect(
                timeZoneResolver.getTimeZoneFromCity(buildTwilioMessage({ FromState: STATE_LA, FromCity: '' }))
            ).toBeUndefined();
        });

        it('will be `undefined` if city does not match state', () => {
            expect(
                timeZoneResolver.getTimeZoneFromCity(buildTwilioMessage({ FromState: STATE_NY, FromCity: CITY_CHI }))
            ).toBeUndefined();
            expect(
                timeZoneResolver.getTimeZoneFromCity(buildTwilioMessage({ FromState: STATE_CHI, FromCity: CITY_LA }))
            ).toBeUndefined();
            expect(
                timeZoneResolver.getTimeZoneFromCity(buildTwilioMessage({ FromState: STATE_LA, FromCity: CITY_NY }))
            ).toBeUndefined();
        });

        it('will find the time zone if city matches the state', () => {
            expect(
                timeZoneResolver.getTimeZoneFromCity(buildTwilioMessage({ FromState: STATE_NY, FromCity: CITY_NY }))
            ).toBe(TIMEZONE_NY);
            expect(
                timeZoneResolver.getTimeZoneFromCity(buildTwilioMessage({ FromState: STATE_CHI, FromCity: CITY_CHI }))
            ).toBe(TIMEZONE_CHI);
            expect(
                timeZoneResolver.getTimeZoneFromCity(buildTwilioMessage({ FromState: STATE_LA, FromCity: CITY_LA }))
            ).toBe(TIMEZONE_LA);
            expect(
                timeZoneResolver.getTimeZoneFromCity(buildTwilioMessage({ FromState: STATE_NE, FromCity: CITY_NE_1 }))
            ).toBe(TIMEZONE_NE_1);
            expect(
                timeZoneResolver.getTimeZoneFromCity(buildTwilioMessage({ FromState: STATE_NE, FromCity: CITY_NE_2 }))
            ).toBe(TIMEZONE_NE_2);
        });
    });

    describe('getTimeZoneFromState', () => {
        it('will be `undefined` if country is not `US`', () => {
            expect(
                timeZoneResolver.getTimeZoneFromState(
                    buildTwilioMessage({ FromCountry: undefined, FromCity: CITY_CHI, FromState: CITY_CHI })
                )
            ).toBeUndefined();
            expect(
                timeZoneResolver.getTimeZoneFromState(
                    buildTwilioMessage({ FromCountry: '', FromCity: CITY_CHI, FromState: CITY_CHI })
                )
            ).toBeUndefined();
            expect(
                timeZoneResolver.getTimeZoneFromState(
                    buildTwilioMessage({ FromCountry: COUNTRY_CN, FromCity: CITY_CHI, FromState: CITY_CHI })
                )
            ).toBeUndefined();
        });

        it('will be `undefined` if state is not provided', () => {
            expect(timeZoneResolver.getTimeZoneFromState(buildTwilioMessage({ FromState: undefined }))).toBeUndefined();
            expect(timeZoneResolver.getTimeZoneFromState(buildTwilioMessage({ FromState: undefined }))).toBeUndefined();
            expect(timeZoneResolver.getTimeZoneFromState(buildTwilioMessage({ FromState: undefined }))).toBeUndefined();
        });

        it('will be `undefined` if invalid state is provided', () => {
            expect(timeZoneResolver.getTimeZoneFromState(buildTwilioMessage({ FromState: '' }))).toBeUndefined();
            expect(timeZoneResolver.getTimeZoneFromState(buildTwilioMessage({ FromState: 'ZZ' }))).toBeUndefined();
            expect(
                timeZoneResolver.getTimeZoneFromState(buildTwilioMessage({ FromState: 'sdfgasdfasdf' }))
            ).toBeUndefined();
        });

        it('will find the time zone if valid state is passed', () => {
            expect(timeZoneResolver.getTimeZoneFromState(buildTwilioMessage({ FromState: STATE_NY }))).toBe(
                TIMEZONE_NY
            );
            expect(timeZoneResolver.getTimeZoneFromState(buildTwilioMessage({ FromState: STATE_CHI }))).toBe(
                TIMEZONE_CHI
            );
            expect(timeZoneResolver.getTimeZoneFromState(buildTwilioMessage({ FromState: STATE_LA }))).toBe(
                TIMEZONE_LA
            );
        });

        it('will choose most prominent time zone if a state has multiple time zones', () => {
            expect(timeZoneResolver.getTimeZoneFromState(buildTwilioMessage({ FromState: STATE_NE }))).toBe(
                TIMEZONE_NE_1
            );
        });
    });

    describe('getTimeZone', () => {
        it('will be `undefined` if country is not `US`', () => {
            expect(
                timeZoneResolver.getTimeZone(
                    buildTwilioMessage({
                        FromCountry: undefined,
                        FromState: STATE_NY,
                        FromCity: CITY_NY,
                        FromZip: ZIP_NY
                    })
                )
            ).toBeUndefined();
            expect(
                timeZoneResolver.getTimeZone(
                    buildTwilioMessage({ FromCountry: '', FromState: STATE_NY, FromCity: CITY_NY, FromZip: ZIP_NY })
                )
            ).toBeUndefined();
            expect(
                timeZoneResolver.getTimeZone(
                    buildTwilioMessage({
                        FromCountry: COUNTRY_CN,
                        FromState: STATE_NY,
                        FromCity: CITY_NY,
                        FromZip: ZIP_NY
                    })
                )
            ).toBeUndefined();
        });

        it('will be `undefined` if no state, city, or zip are provided', () => {
            expect(timeZoneResolver.getTimeZone(buildTwilioMessage())).toBe(undefined);
        });

        it('will opt for time zone of zip code if state and/or city are provided', () => {
            expect(
                timeZoneResolver.getTimeZone(
                    buildTwilioMessage({ FromState: STATE_NY, FromCity: CITY_NY, FromZip: ZIP_LA })
                )
            ).toBe(TIMEZONE_LA);
            expect(timeZoneResolver.getTimeZone(buildTwilioMessage({ FromState: STATE_NY, FromZip: ZIP_CHI }))).toBe(
                TIMEZONE_CHI
            );
            expect(
                timeZoneResolver.getTimeZone(
                    buildTwilioMessage({ FromState: STATE_NE, FromCity: CITY_NE_2, FromZip: ZIP_NE_1 })
                )
            ).toBe(TIMEZONE_NE_1);
            expect(
                timeZoneResolver.getTimeZone(
                    buildTwilioMessage({ FromState: STATE_NE, FromCity: CITY_NE_1, FromZip: ZIP_NE_2 })
                )
            ).toBe(TIMEZONE_NE_2);
        });

        it('will opt for city if no zip code and state and city match', () => {
            expect(timeZoneResolver.getTimeZone(buildTwilioMessage({ FromState: STATE_NY, FromCity: CITY_NY }))).toBe(
                TIMEZONE_NY
            );
            expect(timeZoneResolver.getTimeZone(buildTwilioMessage({ FromState: STATE_CHI, FromCity: CITY_CHI }))).toBe(
                TIMEZONE_CHI
            );
            expect(timeZoneResolver.getTimeZone(buildTwilioMessage({ FromState: STATE_LA, FromCity: CITY_LA }))).toBe(
                TIMEZONE_LA
            );
            expect(timeZoneResolver.getTimeZone(buildTwilioMessage({ FromState: STATE_NE, FromCity: CITY_NE_2 }))).toBe(
                TIMEZONE_NE_2
            );
            expect(timeZoneResolver.getTimeZone(buildTwilioMessage({ FromState: STATE_NE, FromCity: CITY_NE_1 }))).toBe(
                TIMEZONE_NE_1
            );
        });

        it('will opt for state if no zip code, no city, or no matching city', () => {
            expect(timeZoneResolver.getTimeZone(buildTwilioMessage({ FromState: STATE_NY }))).toBe(TIMEZONE_NY);
            expect(timeZoneResolver.getTimeZone(buildTwilioMessage({ FromState: STATE_CHI, FromCity: CITY_NY }))).toBe(
                TIMEZONE_CHI
            );
            expect(timeZoneResolver.getTimeZone(buildTwilioMessage({ FromState: STATE_NE, FromCity: CITY_NY }))).toBe(
                TIMEZONE_NE_1
            );
        });
    });
});

const buildTwilioMessage = createBuildTwilioRequestMessageFunction({
    FromCity: '',
    FromCountry: COUNTRY_US,
    FromState: '',
    FromZip: ''
});
