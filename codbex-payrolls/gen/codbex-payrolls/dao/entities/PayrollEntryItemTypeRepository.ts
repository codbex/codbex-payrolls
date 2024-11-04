import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface PayrollEntryItemTypeEntity {
    readonly Id: number;
    Name?: string;
}

export interface PayrollEntryItemTypeCreateEntity {
    readonly Name?: string;
}

export interface PayrollEntryItemTypeUpdateEntity extends PayrollEntryItemTypeCreateEntity {
    readonly Id: number;
}

export interface PayrollEntryItemTypeEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        contains?: {
            Id?: number;
            Name?: string;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
    },
    $select?: (keyof PayrollEntryItemTypeEntity)[],
    $sort?: string | (keyof PayrollEntryItemTypeEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface PayrollEntryItemTypeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<PayrollEntryItemTypeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface PayrollEntryItemTypeUpdateEntityEvent extends PayrollEntryItemTypeEntityEvent {
    readonly previousEntity: PayrollEntryItemTypeEntity;
}

export class PayrollEntryItemTypeRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PAYROLLENTRYITEMTYPE",
        properties: [
            {
                name: "Id",
                column: "PAYROLLENTRYITEMTYPE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "PAYROLLENTRYITEMTYPE_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(PayrollEntryItemTypeRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: PayrollEntryItemTypeEntityOptions): PayrollEntryItemTypeEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): PayrollEntryItemTypeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: PayrollEntryItemTypeCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PAYROLLENTRYITEMTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYROLLENTRYITEMTYPE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: PayrollEntryItemTypeUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PAYROLLENTRYITEMTYPE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "PAYROLLENTRYITEMTYPE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: PayrollEntryItemTypeCreateEntity | PayrollEntryItemTypeUpdateEntity): number {
        const id = (entity as PayrollEntryItemTypeUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as PayrollEntryItemTypeUpdateEntity);
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
            table: "CODBEX_PAYROLLENTRYITEMTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYROLLENTRYITEMTYPE_ID",
                value: id
            }
        });
    }

    public count(options?: PayrollEntryItemTypeEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PAYROLLENTRYITEMTYPE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: PayrollEntryItemTypeEntityEvent | PayrollEntryItemTypeUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-payrolls-entities-PayrollEntryItemType", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-payrolls-entities-PayrollEntryItemType").send(JSON.stringify(data));
    }
}
