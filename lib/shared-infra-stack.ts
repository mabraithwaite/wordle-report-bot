import { App, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';

export class SharedInfraStack extends Stack {
    userTable: Table;
    wordleStatsTable: Table;

    constructor(scope: App, id: string, props?: StackProps) {
        super(scope, id, props);

        this.addUserTable();
        this.addWordleStatsTable();
    }

    private addUserTable(): void {
        this.userTable = new Table(this, 'user-table', {
            partitionKey: {
                name: 'phoneNumber',
                type: AttributeType.STRING
            },
            billingMode: BillingMode.PAY_PER_REQUEST
        });
    }

    private addWordleStatsTable(): void {
        this.wordleStatsTable = new Table(this, 'wordle-stats-table', {
            partitionKey: {
                name: 'wordleId',
                type: AttributeType.NUMBER
            },
            sortKey: {
                name: 'phoneNumber',
                type: AttributeType.STRING
            },
            billingMode: BillingMode.PAY_PER_REQUEST
        });
    }
}
