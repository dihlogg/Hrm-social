import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConstrantReactions1773823288614 implements MigrationInterface {
    name = 'AddConstrantReactions1773823288614'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ReactionCounts" ALTER COLUMN "count" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "ReactionCounts" ADD CONSTRAINT "UQ_COMMENT_REACTION" UNIQUE ("postCommentId", "reactionType")`);
        await queryRunner.query(`ALTER TABLE "ReactionCounts" ADD CONSTRAINT "UQ_POST_REACTION" UNIQUE ("postId", "reactionType")`);
        await queryRunner.query(`ALTER TABLE "Reactions" ADD CONSTRAINT "UQ_USER_COMMENT_REACTION" UNIQUE ("employeeId", "postCommentId")`);
        await queryRunner.query(`ALTER TABLE "Reactions" ADD CONSTRAINT "UQ_USER_POST_REACTION" UNIQUE ("employeeId", "postId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Reactions" DROP CONSTRAINT "UQ_USER_POST_REACTION"`);
        await queryRunner.query(`ALTER TABLE "Reactions" DROP CONSTRAINT "UQ_USER_COMMENT_REACTION"`);
        await queryRunner.query(`ALTER TABLE "ReactionCounts" DROP CONSTRAINT "UQ_POST_REACTION"`);
        await queryRunner.query(`ALTER TABLE "ReactionCounts" DROP CONSTRAINT "UQ_COMMENT_REACTION"`);
        await queryRunner.query(`ALTER TABLE "ReactionCounts" ALTER COLUMN "count" DROP DEFAULT`);
    }

}
