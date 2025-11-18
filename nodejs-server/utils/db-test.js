import { testConnection } from "../config/database.js";

// 独立的数据库连接测试脚本
async function main() {
  console.log("开始测试数据库连接...\n");
  const connected = await testConnection();
  
  if (connected) {
    console.log("\n✅ 数据库连接测试通过");
    process.exit(0);
  } else {
    console.log("\n❌ 数据库连接测试失败");
    process.exit(1);
  }
}

main();

