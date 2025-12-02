import { config } from "dotenv";

const envFilePath = process.env.npm_package_config_envFile || '../../config/database/.env';

if (envFilePath) console.log(`Using env file: ${envFilePath}`);
else console.log('No env file initialized');

export const loadEnv = () => {
    config({
        path: envFilePath,
        quiet: true,
    })
}
export { envFilePath }