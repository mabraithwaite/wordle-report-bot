import { DynamoDBDocumentClient, paginateQuery, paginateScan } from '@aws-sdk/lib-dynamodb';
import { keys, mapValues } from 'lodash-es';
import { DateTime } from 'luxon';
import { USER_TABLE_NAME_KEY, WORDLE_STATS_TABLE_NAME_KEY } from '../../constants/table-names';
import { User } from '../model/user';
import { WordleStat } from '../model/wordle-stat';
import { EnvironmentVariableUtil } from '../util/env/environment-variable-util';

export class StatsCollector {
    constructor(private dynamoClient: DynamoDBDocumentClient) {}

    public async getWeekStatsByDay(date: DateTime): Promise<{
        phoneToScoreMap: { [key: string]: number };
        phoneToNameMap: { [key: string]: string };
    }> {
        const [wordleIdStart, wordleIdEnd] = this.getWordleIdRange(date);
        console.log(`wordleIdStart: ${wordleIdStart} wordleIdEnd: ${wordleIdEnd}`);
        const stats = await this.getAllStats(wordleIdStart, wordleIdEnd);
        const phoneToScoreMap: { [key: string]: number } = this.mapStatsToScoreMap(
            wordleIdStart,
            wordleIdEnd,
            stats
        );
        const phoneToNameMap: { [key: string]: string } = await this.getPhoneToNameMap(
            keys(phoneToScoreMap)
        );
        return { phoneToScoreMap, phoneToNameMap };
    }

    private async getAllStats(wordleIdStart: number, wordleIdEnd: number): Promise<WordleStat[]> {
        let stats: WordleStat[] = [];
        for (let id = wordleIdStart; id <= wordleIdEnd; ++id) {
            stats.push(...(await this.getStatsById(id)));
        }
        return stats;
    }

    private async getStatsById(wordleId: number): Promise<WordleStat[]> {
        let stats: WordleStat[] = [];
        const paginator = paginateQuery(
            { client: this.dynamoClient },
            {
                TableName: EnvironmentVariableUtil.getVariableOrThrow(WORDLE_STATS_TABLE_NAME_KEY),
                KeyConditionExpression: 'wordleId = :v_wordleId',
                ExpressionAttributeValues: { ':v_wordleId': wordleId }
            }
        );

        let continuing = true;
        do {
            const queryCommandOutput = await paginator.next();
            if ((queryCommandOutput?.value?.Items?.length || 0) > 0) {
                stats.push(...(queryCommandOutput.value.Items as WordleStat[]));
            } else {
                continuing = false;
            }
        } while (continuing);
        return stats;
    }

    private async getPhoneToNameMap(phoneNumbers: string[]): Promise<{ [key: string]: string }> {
        const phoneToNameMap: { [key: string]: string } = {};
        const paginator = paginateScan(
            { client: this.dynamoClient },
            {
                TableName: EnvironmentVariableUtil.getVariableOrThrow(USER_TABLE_NAME_KEY)
            }
        );
        const phoneToDynamoNameMap: { [key: string]: string } = {};
        let continuing = true;
        do {
            const scanCommandOutput = await paginator.next();
            if ((scanCommandOutput?.value?.Items?.length || 0) > 0) {
                for (const user of scanCommandOutput.value.Items as User[]) {
                    phoneToDynamoNameMap[user.phoneNumber] = user.name;
                }
            } else {
                continuing = false;
            }
        } while (continuing);

        for (const phoneNumber of phoneNumbers) {
            phoneToNameMap[phoneNumber] = phoneToDynamoNameMap[phoneNumber] || phoneNumber;
        }
        return phoneToNameMap;
    }

    private mapStatsToScoreMap(
        wordleIdStart: number,
        wordleIdEnd: number,
        stats: WordleStat[]
    ): { [key: string]: number } {
        const phoneToScoresMap: { [key: string]: number[] } = {};
        for (const stat of stats) {
            phoneToScoresMap[stat.phoneNumber] = phoneToScoresMap[stat.phoneNumber] || [];
            phoneToScoresMap[stat.phoneNumber].push(stat.score);
        }
        return mapValues(
            phoneToScoresMap,
            (scores) =>
                scores.reduce((p, c) => p + c, 0) +
                8 * (wordleIdEnd - wordleIdStart + 1 - scores.length)
        );
    }

    private getWordleIdRange(date?: DateTime): number[] {
        // Sep 9, 2022 was id 447
        const startDate = (date || DateTime.now()).startOf('week');
        let endDate;
        if (DateTime.now() < startDate.plus({ days: 6 })) {
            endDate = DateTime.now();
        } else {
            endDate = startDate.plus({ days: 6 });
        }
        const startDateId = this.getDaysSinceSept9(startDate) + 447;
        const endDateId = this.getDaysSinceSept9(endDate) + 447;
        return [startDateId, endDateId];
    }

    private getDaysSinceSept9(date: DateTime): number {
        return Math.floor(date.diff(DateTime.fromISO('2022-09-09'), 'days').days);
    }
}