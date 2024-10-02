import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface PayrollPeriodEntity {
    readonly Id: number;
    Title?: string;
    StartDate?: Date;
    EndDate?: Date;
}

export interface PayrollPeriodCreateEntity {
    readonly Title?: string;
    readonly StartDate?: Date;
    readonly EndDate?: Date;
}

export interface PayrollPeriodUpdateEntity extends PayrollPeriodCreateEntity {
    readonly Id: number;
}

export interface PayrollPeriodEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Title?: string | string[];
            StartDate?: Date | Date[];
            EndDate?: Date | Date[];
        };
        notEquals?: {
            Id?: number | number[];
            Title?: string | string[];
            StartDate?: Date | Date[];
            EndDate?: Date | Date[];
        };
        contains?: {
            Id?: number;
            Title?: string;
            StartDate?: Date;
            EndDate?: Date;
        };
        greaterThan?: {
            Id?: number;
            Title?: string;
            StartDate?: Date;
            EndDate?: Date;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Title?: string;
            StartDate?: Date;
            EndDate?: Date;
        };
        lessThan?: {
            Id?: number;
            Title?: string;
            StartDate?: Date;
            EndDate?: Date;
        };
        lessThanOrEqual?: {
            Id?: number;
            Title?: string;
            StartDate?: Date;
            EndDate?: Date;
        };
    },
    $select?: (keyof PayrollPeriodEntity)[],
    $sort?: string | (keyof PayrollPeriodEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface PayrollPeriodEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<PayrollPeriodEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface PayrollPeriodUpdateEntityEvent extends PayrollPeriodEntityEvent {
    readonly previousEntity: PayrollPeriodEntity;
}

export class PayrollPeriodRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PAYROLLPERIOD",
        properties: [
            {
                name: "Id",
                column: "PAYROLLPERIOD_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Title",
                column: "PAYROLLPERIOD_TITLE",
                type: "VARCHAR",
            },
            {
                name: "StartDate",
                column: "PAYROLLPERIOD_STARTDATE",
                type: "DATE",
            },
            {
                name: "EndDate",
                column: "PAYROLLPERIOD_ENDDATE",
                type: "DATE",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(PayrollPeriodRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: PayrollPeriodEntityOptions): PayrollPeriodEntity[] {
        return this.dao.list(options).map((e: PayrollPeriodEntity) => {
            EntityUtils.setDate(e, "StartDate");
            EntityUtils.setDate(e, "EndDate");
            return e;
        });
    }

    public findById(id: number): PayrollPeriodEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "StartDate");
        EntityUtils.setDate(entity, "EndDate");
        return entity ?? undefined;
    }

    public create(entity: PayrollPeriodCreateEntity): number {
        EntityUtils.setLocalDate(entity, "StartDate");
        EntityUtils.setLocalDate(entity, "EndDate");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PAYROLLPERIOD",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYROLLPERIOD_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: PayrollPeriodUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "StartDate");
        // EntityUtils.setLocalDate(entity, "EndDate");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PAYROLLPERIOD",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "PAYROLLPERIOD_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: PayrollPeriodCreateEntity | PayrollPeriodUpdateEntity): number {
        const id = (entity as PayrollPeriodUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as PayrollPeriodUpdateEntity);
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
            table: "CODBEX_PAYROLLPERIOD",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYROLLPERIOD_ID",
                value: id
            }
        });
    }

    public count(options?: PayrollPeriodEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PAYROLLPERIOD"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: PayrollPeriodEntityEvent | PayrollPeriodUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-payrolls-entities-PayrollPeriod", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-payrolls-entities-PayrollPeriod").send(JSON.stringify(data));
    }
}
