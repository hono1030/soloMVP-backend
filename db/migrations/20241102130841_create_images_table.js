/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("images", function (table) {
    table.increments("id").primary();
    table.integer("user_id");
    table.foreign("user_id").references("id").inTable("users");
    table.integer("prefecture_code");
    table
      .foreign("prefecture_code")
      .references("prefecture_code")
      .inTable("prefectures");
    table.string("bucket");
    table.string("key");
    table.timestamp("uploaded_at").defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("images");
};
