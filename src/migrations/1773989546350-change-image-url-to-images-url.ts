import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeImageUrlToImagesUrl1773989546350 implements MigrationInterface {
    name = 'ChangeImageUrlToImagesUrl1773989546350'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Posts" RENAME COLUMN "imageUrl" TO "imageUrls"`);
        await queryRunner.query(`ALTER TABLE "Posts" DROP COLUMN "imageUrls"`);
        await queryRunner.query(`ALTER TABLE "Posts" ADD "imageUrls" text array`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Posts" DROP COLUMN "imageUrls"`);
        await queryRunner.query(`ALTER TABLE "Posts" ADD "imageUrls" character varying`);
        await queryRunner.query(`ALTER TABLE "Posts" RENAME COLUMN "imageUrls" TO "imageUrl"`);
    }

}
