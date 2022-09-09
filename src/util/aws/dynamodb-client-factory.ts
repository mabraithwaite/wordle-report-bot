import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, TranslateConfig } from '@aws-sdk/lib-dynamodb';
import { EnvironmentVariableUtil } from '../env/environment-variable-util';

export class DynamoDbClientFactory {
    public static getDynamoDbClient(config?: DynamoDBClientConfig) {
        if (!config?.region && !process.env.AWS_REGION) {
            EnvironmentVariableUtil.checkVariable('AWS_REGION');
        }
        return new DynamoDBClient({
            region: process.env.AWS_REGION,
            ...config
        });
    }

    public static getDynamoDbDocumentClient(
        dynamoClient?: DynamoDBClient,
        translateConfig?: TranslateConfig
    ) {
        return DynamoDBDocumentClient.from(
            dynamoClient || DynamoDbClientFactory.getDynamoDbClient(),
            {
                marshallOptions: { convertClassInstanceToMap: true },
                ...translateConfig
            }
        );
    }
}
