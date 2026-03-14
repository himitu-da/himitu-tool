require('dotenv').config({ path: '.env.local' });
const ftp = require('basic-ftp');
const path = require('path');

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        const { FTP_HOST, FTP_USER, FTP_PASSWORD, FTP_PORT, FTP_DIR } = process.env;

        if (!FTP_HOST || !FTP_USER || !FTP_PASSWORD) {
            throw new Error("Missing FTP credentials in .env.local file.");
        }

        console.log("Connecting to FTP server...");
        await client.access({
            host: FTP_HOST,
            user: FTP_USER,
            password: FTP_PASSWORD,
            port: FTP_PORT ? parseInt(FTP_PORT, 10) : 21,
            secure: false
        });

        console.log(`Uploading out/ folder to ${FTP_DIR || '/'}...`);
        const localDir = path.join(__dirname, '../out');
        
        // Ensure remote dir exists and navigate to it
        if (FTP_DIR) {
            await client.ensureDir(FTP_DIR);
            await client.cd(FTP_DIR);
        } else {
            await client.cd('/');
        }

        // Upload directory
        await client.uploadFromDir(localDir);

        console.log("Deployment finished successfully!");
    } catch (err) {
        console.error("Deployment failed:", err);
        process.exit(1);
    } finally {
        client.close();
    }
}

deploy();
