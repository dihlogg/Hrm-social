import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldEmployeeAvatarUrl1773893604750 implements MigrationInterface {
    name = 'AddFieldEmployeeAvatarUrl1773893604750'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Posts" ADD "employeeAvatarUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "PostComments" ADD "employeeAvatarUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "Reactions" ADD "employeeAvatarUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Reactions" DROP COLUMN "employeeAvatarUrl"`);
        await queryRunner.query(`ALTER TABLE "PostComments" DROP COLUMN "employeeAvatarUrl"`);
        await queryRunner.query(`ALTER TABLE "Posts" DROP COLUMN "employeeAvatarUrl"`);
    }

}
