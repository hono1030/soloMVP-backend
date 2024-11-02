/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("prefectures", function (table) {
    table.integer("prefecture_code").unique().alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("prefectures", function (table) {
    table.integer("prefecture_code").alter();
  });
};
