#!/usr/bin/env node

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function validateServerJson() {
  try {
    // Fetch the schema
    const schemaUrl = 'https://static.modelcontextprotocol.io/schemas/2025-09-16/server.schema.json';
    console.log('Fetching schema from:', schemaUrl);

    const schemaResponse = await fetch(schemaUrl);
    if (!schemaResponse.ok) {
      throw new Error(`Failed to fetch schema: ${schemaResponse.statusText}`);
    }

    const schema = await schemaResponse.json();

    // Read server.json
    const serverJsonPath = join(__dirname, 'server.json');
    console.log('Reading server.json from:', serverJsonPath);

    const serverJson = JSON.parse(readFileSync(serverJsonPath, 'utf8'));

    // Validate
    const ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);

    const validate = ajv.compile(schema);
    const valid = validate(serverJson);

    if (valid) {
      console.log('✅ server.json is valid!');
      process.exit(0);
    } else {
      console.error('❌ server.json validation failed:');
      console.error(JSON.stringify(validate.errors, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error('Error during validation:', error.message);
    process.exit(1);
  }
}

validateServerJson();
