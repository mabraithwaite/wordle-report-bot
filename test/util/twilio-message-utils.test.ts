import { TwilioMessageUtils } from '../../src/util/twilio-message-utils';
import { createBuildTwilioRequestMessageFunction } from '../test-utils';

describe('TwilioMessageUtils', () => {
    let messageUtil: TwilioMessageUtils;

    beforeEach(() => {
        messageUtil = TwilioMessageUtils.getInstance();
    });

    describe('isMessageFromUS', () => {
        it('will return false if country is not provided', () => {
            expect(messageUtil.isMessageFromUS(buildTwilioMessage({ FromCountry: undefined }))).toBe(false);
            expect(messageUtil.isMessageFromUS(buildTwilioMessage({ FromCountry: '' }))).toBe(false);
        });

        it('will return false if country is not US', () => {
            expect(messageUtil.isMessageFromUS(buildTwilioMessage({ FromCountry: 'CN' }))).toBe(false);
        });

        it('will return true if country is US', () => {
            expect(messageUtil.isMessageFromUS(buildTwilioMessage({ FromCountry: 'us' }))).toBe(true);
            expect(messageUtil.isMessageFromUS(buildTwilioMessage({ FromCountry: 'US' }))).toBe(true);
            expect(messageUtil.isMessageFromUS(buildTwilioMessage({ FromCountry: ' Us ' }))).toBe(true);
        });
    });

    describe('resolveField', () => {
        it('will return empty string if field is not provided', () => {
            expect(messageUtil.resolveField(buildTwilioMessage({ FromCountry: undefined }).FromCountry)).toBe('');
            expect(messageUtil.resolveField(buildTwilioMessage({ FromCity: undefined }).FromCity)).toBe('');
            expect(messageUtil.resolveField(buildTwilioMessage({ FromZip: undefined }).FromZip)).toBe('');
        });

        it('will return empty string if field is only white space', () => {
            expect(messageUtil.resolveField(buildTwilioMessage({ FromCountry: '' }).FromCountry)).toBe('');
            expect(messageUtil.resolveField(buildTwilioMessage({ FromCity: '   ' }).FromCity)).toBe('');
            expect(messageUtil.resolveField(buildTwilioMessage({ FromZip: '\n\t  \t' }).FromZip)).toBe('');
        });

        it('will return trimmed field', () => {
            expect(messageUtil.resolveField(buildTwilioMessage({ FromCountry: ' Us ' }).FromCountry)).toBe('Us');
            expect(messageUtil.resolveField(buildTwilioMessage({ FromCity: 'LA' }).FromCity)).toBe('LA');
            expect(messageUtil.resolveField(buildTwilioMessage({ FromZip: '   56983               ' }).FromZip)).toBe(
                '56983'
            );
        });
    });
});

const buildTwilioMessage = createBuildTwilioRequestMessageFunction();
