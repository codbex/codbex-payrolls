import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface PayrollStatusEntity {
    readonly Id: number;
    Name?: string;
}

export interface PayrollStatusCreateEntity {
    readonly Name?: string;
}

export interface PayrollStatusUpdateEntity extends PayrollStatusCreateEntity {
    readonly Id: number;
}

export interface PayrollStatusEntityOptions {
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
    $select?: (keyof PayrollStatusEntity)[],
    $sort?: string | (keyof PayrollStatusEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface PayrollStatusEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<PayrollStatusEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface PayrollStatusUpdateEntityEvent extends PayrollStatusEntityEvent {
    readonly previousEntity: PayrollStatusEntity;
}

export class PayrollStatusRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PAYROLLSTATUS",
        properties: [
            {
                name: "Id",
                column: "PAYROLLSTATUS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "PAYROLLSTATUS_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(PayrollStatusRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: PayrollStatusEntityOptions): PayrollStatusEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): PayrollStatusEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: PayrollStatusCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PAYROLLSTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYROLLSTATUS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: PayrollStatusUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PAYROLLSTATUS",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "PAYROLLSTATUS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: PayrollStatusCreateEntity | PayrollStatusUpdateEntity): number {
        const id = (entity as PayrollStatusUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as PayrollStatusUpdateEntity);
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
            table: "CODBEX_PAYROLLSTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYROLLSTATUS_ID",
                value: id
            }
        });
    }

    public count(options?: PayrollStatusEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PAYROLLSTATUS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: PayrollStatusEntityEvent | PayrollStatusUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-payrolls-Settings-PayrollStatus", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-payrolls-Settings-PayrollStatus").send(JSON.stringify(data));
    }
}
