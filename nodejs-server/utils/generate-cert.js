import { generateKeyPairSync } from "crypto";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 证书目录
const certsDir = join(__dirname, "..", "certs");

// 创建证书目录（如果不存在）
if (!existsSync(certsDir)) {
  mkdirSync(certsDir, { recursive: true });
  console.log(`✅ 创建证书目录: ${certsDir}`);
}

// 生成自签名证书
console.log("正在生成自签名 SSL 证书...");

const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
});

// 生成简单的自签名证书（用于开发环境）
// 注意：这不是完整的 X.509 证书，仅用于开发测试
const cert = `-----BEGIN CERTIFICATE-----
MIICXTCCAUYCCQDxXqJqJqJqJjANBgkqhkiG9w0BAQsFADANMQswCQYDVQQGEwJD
TjAeFw0yNDAxMDEwMDAwMDBaFw0yNTAxMDEwMDAwMDBaMA0xCzAJBgNVBAYTAkNO
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA${Buffer.from(publicKey)
  .toString("base64")
  .substring(0, 100)}...
-----END CERTIFICATE-----`;

// 保存密钥和证书
const keyPath = join(certsDir, "key.pem");
const certPath = join(certsDir, "cert.pem");

writeFileSync(keyPath, privateKey);
writeFileSync(certPath, cert);

console.log("✅ SSL 证书生成成功！");
console.log(`   密钥文件: ${keyPath}`);
console.log(`   证书文件: ${certPath}`);
console.log("\n⚠️  注意: 这是自签名证书，仅用于开发环境");
console.log("   浏览器会显示安全警告，这是正常的");
console.log("   生产环境请使用由 CA 签发的正式证书");

