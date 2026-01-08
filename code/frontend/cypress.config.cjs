/* eslint-disable @typescript-eslint/no-require-imports */
const { defineConfig } = require('cypress');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });
const { sequelize: db } = require('../backend/config/database');
const { initModels } = require('../backend/models');

module.exports = defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.e2e.test.js',
    baseUrl: 'http://localhost:5173', // your frontend
    experimentalRunAllSpecs: true,
    env: {
      BACKEND_URL: 'http://localhost:3000', // your API
      USER_EMAIL: "john@example.com",
      USER_PASSWORD: "GRY0xa7jRRPfLy9XxC3v",
    },
    setupNodeEvents(on) {
      on('task', {
        async clearDB() {
          console.log('Cleaning DB...');
          try {
            await db.authenticate();
            const models = initModels(db);
            await db.sync(); // ensure tables exist
            await Promise.all(
              Object.values(models)
              .filter((m) => m && typeof m.destroy === "function")
              .map((m) => m.destroy({ where: {} })) // use DELETE not TRUNCATE
            );
            return null;
          } catch (e) {
            console.error('DB Clean error:', e);
            throw e;
          }
        },
      });
    },
  },
});
