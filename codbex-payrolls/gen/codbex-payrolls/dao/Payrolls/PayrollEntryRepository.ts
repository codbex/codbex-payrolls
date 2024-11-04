import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface PayrollEntryEntity {
    readonly Id: number;
    Employee?: number;
    Title?: string;
    NetSalary?: number;
    Taxes?: number;
    StartDate?: Date;
    EndDate?: Date;
    Status?: number;
    PayDate?: Date;
}

export interface PayrollEntryCreateEntity {
    readonly Employee?: number;
    readonly Title?: string;
    readonly NetSalary?: number;
    readonly Taxes?: number;
    readonly StartDate?: Date;
    readonly EndDate?: Date;
    readonly Status?: number;
    readonly PayDate?: Date;
}

export interface PayrollEntryUpdateEntity extends PayrollEntryCreateEntity {
    readonly Id: number;
}

export interface PayrollEntryEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Employee?: number | number[];
            Title?: string | string[];
            NetSalary?: number | number[];
            Taxes?: number | number[];
            StartDate?: Date | Date[];
            EndDate?: Date | Date[];
            Status?: number | number[];
            PayDate?: Date | Date[];
        };
        notEquals?: {
            Id?: number | number[];
            Employee?: number | number[];
            Title?: string | string[];
            NetSalary?: number | number[];
            Taxes?: number | number[];
            StartDate?: Date | Date[];
            EndDate?: Date | Date[];
            Status?: number | number[];
            PayDate?: Date | Date[];
        };
        contains?: {
            Id?: number;
            Employee?: number;
            Title?: string;
            NetSalary?: number;
            Taxes?: number;
            StartDate?: Date;
            EndDate?: Date;
            Status?: number;
            PayDate?: Date;
        };
        greaterThan?: {
            Id?: number;
            Employee?: number;
            Title?: string;
            NetSalary?: number;
            Taxes?: number;
            StartDate?: Date;
            EndDate?: Date;
            Status?: number;
            PayDate?: Date;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Employee?: number;
            Title?: string;
            NetSalary?: number;
            Taxes?: number;
            StartDate?: Date;
            EndDate?: Date;
            Status?: number;
            PayDate?: Date;
        };
        lessThan?: {
            Id?: number;
            Employee?: number;
            Title?: string;
            NetSalary?: number;
            Taxes?: number;
            StartDate?: Date;
            EndDate?: Date;
            Status?: number;
            PayDate?: Date;
        };
        lessThanOrEqual?: {
            Id?: number;
            Employee?: number;
            Title?: string;
            NetSalary?: number;
            Taxes?: number;
            StartDate?: Date;
            EndDate?: Date;
            Status?: number;
            PayDate?: Date;
        };
    },
    $select?: (keyof PayrollEntryEntity)[],
    $sort?: string | (keyof PayrollEntryEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface PayrollEntryEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<PayrollEntryEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface PayrollEntryUpdateEntityEvent extends PayrollEntryEntityEvent {
    readonly previousEntity: PayrollEntryEntity;
}

export class PayrollEntryRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PAYROLLENTRY",
        properties: [
            {
                name: "Id",
                column: "PAYROLLENTRY_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Employee",
                column: "PAYROLLENTRY_EMPLOYEE",
                type: "INTEGER",
            },
            {
                name: "Title",
                column: "PAYROLLENTRY_TITLE",
                type: "VARCHAR",
            },
            {
                name: "NetSalary",
                column: "PAYROLLENTRY_NETSALARY",
                type: "DOUBLE",
            },
            {
                name: "Taxes",
                column: "PAYROLLENTRY_TAXES",
                type: "DOUBLE",
            },
            {
                name: "StartDate",
                column: "PAYROLLENTRY_STARTDATE",
                type: "DATE",
            },
            {
                name: "EndDate",
                column: "PAYROLLENTRY_ENDDATE",
                type: "DATE",
            },
            {
                name: "Status",
                column: "PAYROLLENTRY_STATUS",
                type: "INTEGER",
            },
            {
                name: "PayDate",
                column: "PAYROLLENTRY_PAYDATE",
                type: "DATE",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(PayrollEntryRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: PayrollEntryEntityOptions): PayrollEntryEntity[] {
        return this.dao.list(options).map((e: PayrollEntryEntity) => {
            EntityUtils.setDate(e, "StartDate");
            EntityUtils.setDate(e, "EndDate");
            EntityUtils.setDate(e, "PayDate");
            return e;
        });
    }

    public findById(id: number): PayrollEntryEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "StartDate");
        EntityUtils.setDate(entity, "EndDate");
        EntityUtils.setDate(entity, "PayDate");
        return entity ?? undefined;
    }

    public create(entity: PayrollEntryCreateEntity): number {
        EntityUtils.setLocalDate(entity, "StartDate");
        EntityUtils.setLocalDate(entity, "EndDate");
        EntityUtils.setLocalDate(entity, "PayDate");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PAYROLLENTRY",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYROLLENTRY_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: PayrollEntryUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "StartDate");
        // EntityUtils.setLocalDate(entity, "EndDate");
        // EntityUtils.setLocalDate(entity, "PayDate");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PAYROLLENTRY",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "PAYROLLENTRY_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: PayrollEntryCreateEntity | PayrollEntryUpdateEntity): number {
        const id = (entity as PayrollEntryUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as PayrollEntryUpdateEntity);
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
            table: "CODBEX_PAYROLLENTRY",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYROLLENTRY_ID",
                value: id
            }
        });
    }

    public count(options?: PayrollEntryEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PAYROLLENTRY"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: PayrollEntryEntityEvent | PayrollEntryUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-payrolls-Payrolls-PayrollEntry", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-payrolls-Payrolls-PayrollEntry").send(JSON.stringify(data));
    }
}
