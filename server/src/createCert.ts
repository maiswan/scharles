import mkcert from "mkcert";
import { promises as fs } from "fs";

const certDir = "./certs";

(async () => {
    const ca = await mkcert.createCA({
        organization: "maiswan",
        countryCode: "US",
        state: "Dummy state",
        locality: "Dummy locality",
        validity: 365
    });

    await fs.mkdir(certDir, { recursive: true });
    await fs.writeFile(`${certDir}/ca.crt`, ca.cert);
    await fs.writeFile(`${certDir}/ca.key`, ca.key);

    console.log("CA created. Import ca.crt into your OS/browser trust store.");

    const cert = await mkcert.createCert({
        domains: ["localhost", "127.0.0.1"],
        validity: 365,
        ca
    });

    await fs.writeFile(`${certDir}/server.crt`, cert.cert);
    await fs.writeFile(`${certDir}/server.key`, cert.key);

    console.log("Server certificate created.");
})();
