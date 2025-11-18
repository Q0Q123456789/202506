import bcrypt from "bcryptjs";
import { query } from "../config/database.js";
import { randomBytes } from "crypto";

export class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
  }

  // 生成唯一 ID
  static generateId() {
    return randomBytes(16).toString("hex");
  }

  // 查找用户（通过用户名）
  static async findByUsername(username) {
    try {
      const results = await query("SELECT * FROM users WHERE username = ?", [
        username,
      ]);
      if (results.length === 0) {
        return null;
      }
      return new User(results[0]);
    } catch (error) {
      console.error("查找用户失败:", error);
      throw error;
    }
  }

  // 查找用户（通过邮箱）
  static async findByEmail(email) {
    try {
      const results = await query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);
      if (results.length === 0) {
        return null;
      }
      return new User(results[0]);
    } catch (error) {
      console.error("查找用户失败:", error);
      throw error;
    }
  }

  // 查找用户（通过 ID）
  static async findById(id) {
    try {
      const results = await query("SELECT * FROM users WHERE id = ?", [id]);
      if (results.length === 0) {
        return null;
      }
      return new User(results[0]);
    } catch (error) {
      console.error("查找用户失败:", error);
      throw error;
    }
  }

  // 保存用户（注册时使用）
  static async save(username, email, password) {
    try {
      // 检查用户名是否已存在
      const existingUser = await this.findByUsername(username);
      if (existingUser) {
        throw new Error("用户名已存在");
      }

      // 检查邮箱是否已存在
      const existingEmail = await this.findByEmail(email);
      if (existingEmail) {
        throw new Error("邮箱已被注册");
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 生成 ID
      const id = this.generateId();

      // 插入数据库
      await query(
        "INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)",
        [id, username, email, hashedPassword]
      );

      // 返回创建的用户
      const user = await this.findById(id);
      return user;
    } catch (error) {
      if (
        error.message === "用户名已存在" ||
        error.message === "邮箱已被注册"
      ) {
        throw error;
      }
      console.error("保存用户失败:", error);
      throw new Error("注册失败: " + error.message);
    }
  }

  // 验证密码
  static async verifyPassword(user, password) {
    if (!user || !user.password) {
      return false;
    }
    return await bcrypt.compare(password, user.password);
  }

  // 获取所有用户（仅用于调试）
  static async getAll() {
    try {
      const results = await query(
        "SELECT * FROM users ORDER BY created_at DESC"
      );
      return results.map((row) => new User(row));
    } catch (error) {
      console.error("获取用户列表失败:", error);
      throw error;
    }
  }

  // 转换为 JSON（排除密码）
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
