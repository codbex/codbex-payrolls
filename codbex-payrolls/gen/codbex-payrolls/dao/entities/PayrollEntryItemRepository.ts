import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface PayrollEntryItemEntity {
    readonly Id: number;
    Type?: number;
    Amount?: number;
    PayrollEntry?: number;
}

export interface PayrollEntryItemCreateEntity {
    readonly Type?: number;
    readonly Amount?: number;
    readonly PayrollEntry?: number;
}

export interface PayrollEntryItemUpdateEntity extends PayrollEntryItemCreateEntity {
    readonly Id: number;
}

export interface PayrollEntryItemEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Type?: number | number[];
            Amount?: number | number[];
            PayrollEntry?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Type?: number | number[];
            Amount?: number | number[];
            PayrollEntry?: number | number[];
        };
        contains?: {
            Id?: number;
            Type?: number;
            Amount?: number;
            PayrollEntry?: number;
        };
        greaterThan?: {
            Id?: number;
            Type?: number;
            Amount?: number;
            PayrollEntry?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Type?: number;
            Amount?: number;
            PayrollEntry?: number;
        };
        lessThan?: {
            Id?: number;
            Type?: number;
            Amount?: number;
            PayrollEntry?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Type?: number;
            Amount?: number;
            PayrollEntry?: number;
        };
    },
    $select?: (keyof PayrollEntryItemEntity)[],
    $sort?: string | (keyof PayrollEntryItemEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface PayrollEntryItemEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<PayrollEntryItemEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface PayrollEntryItemUpdateEntityEvent extends PayrollEntryItemEntityEvent {
    readonly previousEntity: PayrollEntryItemEntity;
}

export class PayrollEntryItemRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PAYROLLENTRYITEM",
        properties: [
            {
                name: "Id",
                column: "PAYROLLENTRYITEM_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Type",
                column: "PAYROLLENTRYITEM_TYPE",
                type: "INTEGER",
            },
            {
                name: "Amount",
                column: "PAYROLLENTRYITEM_AMOUNT",
                type: "DOUBLE",
            },
            {
                name: "PayrollEntry",
                column: "PAYROLLENTRYITEM_PAYROLLENTRY",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(PayrollEntryItemRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: PayrollEntryItemEntityOptions): PayrollEntryItemEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): PayrollEntryItemEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: PayrollEntryItemCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PAYROLLENTRYITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYROLLENTRYITEM_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: PayrollEntryItemUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PAYROLLENTRYITEM",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "PAYROLLENTRYITEM_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: PayrollEntryItemCreateEntity | PayrollEntryItemUpdateEntity): number {
        const id = (entity as PayrollEntryItemUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as PayrollEntryItemUpdateEntity);
            return id;
        } else {
            return this.create(entity);
        }
    }

    public deleteById(id: number): void {
        const entity = this.dao.find(id);
        this.dao.remove(id);
        this.triggerEvent({
            operation: "delete",
            table: "CODBEX_PAYROLLENTRYITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYROLLENTRYITEM_ID",
                value: id
            }
        });
    }

    public count(options?: PayrollEntryItemEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PAYROLLENTRYITEM"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: PayrollEntryItemEntityEvent | PayrollEntryItemUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-payrolls-entities-PayrollEntryItem", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-payrolls-entities-PayrollEntryItem").send(JSON.stringify(data));
    }
}
