/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("users").del();
  await knex("users").insert([
    {
      username: "Honoka",
      password: "hono1030",
    },
    {
      username: "Ai",
      password: "ai0808",
    },
    {
      username: "Andy",
      password: "Andy0719",
    },
  ]);
};
