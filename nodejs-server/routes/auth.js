import express from "express";
import { User } from "../models/user.js";
import { generateToken, authenticateToken } from "../middleware/auth.js";
import logger from "../utils/logger.js";

const router = express.Router();

// 用户注册
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.query;
    logger.info("用户注册请求", { username, email, ip: req.ip });

    // 验证输入
    if (!username || !email || !password) {
      logger.warn("注册失败: 缺少必要参数", { username, email, ip: req.ip });
      return res.status(400).json({ error: "请提供用户名、邮箱和密码" });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logger.warn("注册失败: 邮箱格式不正确", { email, ip: req.ip });
      return res.status(400).json({ error: "邮箱格式不正确" });
    }

    // 验证密码长度
    if (password.length < 6) {
      logger.warn("注册失败: 密码长度不足", { username, ip: req.ip });
      return res.status(400).json({ error: "密码长度至少为 6 位" });
    }

    // 创建用户
    const user = await User.save(username, email, password);

    // 生成 token
    const token = generateToken(user);

    logger.info("用户注册成功", {
      userId: user.id,
      username,
      email,
      ip: req.ip,
    });

    res.status(201).json({
      message: "注册成功",
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    if (error.message === "用户名已存在" || error.message === "邮箱已被注册") {
      logger.warn("注册失败: 用户名或邮箱已存在", {
        error: error.message,
        ip: req.ip,
      });
      return res.status(409).json({ error: error.message });
    }
    logger.logError(error, { action: "register", ip: req.ip });
    res.status(500).json({ error: "注册失败", details: error.message });
  }
});

// 用户登录
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.query;
    logger.info("用户登录请求", { username, ip: req.ip });

    // 验证输入
    if (!username || !password) {
      logger.warn("登录失败: 缺少必要参数", { username, ip: req.ip });
      return res.status(400).json({ error: "请提供用户名和密码" });
    }

    // 查找用户（可以通过用户名或邮箱登录）
    let user = await User.findByUsername(username);
    if (!user) {
      user = await User.findByEmail(username);
    }

    if (!user) {
      logger.warn("登录失败: 用户不存在", { username, ip: req.ip });
      return res.status(401).json({ error: "用户名或密码错误" });
    }

    // 验证密码
    const isValidPassword = await User.verifyPassword(user, password);
    if (!isValidPassword) {
      logger.warn("登录失败: 密码错误", {
        userId: user.id,
        username,
        ip: req.ip,
      });
      return res.status(401).json({ error: "用户名或密码错误" });
    }

    // 生成 token
    const token = generateToken(user);

    logger.info("用户登录成功", { userId: user.id, username, ip: req.ip });

    res.json({
      message: "登录成功",
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    logger.logError(error, { action: "login", ip: req.ip });
    res.status(500).json({ error: "登录失败", details: error.message });
  }
});

// 获取当前用户信息（需要认证）
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      logger.warn("获取用户信息失败: 用户不存在", {
        userId: req.user.id,
        ip: req.ip,
      });
      return res.status(404).json({ error: "用户不存在" });
    }

    logger.debug("获取用户信息成功", { userId: user.id, ip: req.ip });

    res.json({
      user: user.toJSON(),
    });
  } catch (error) {
    logger.logError(error, {
      action: "getUserInfo",
      userId: req.user?.id,
      ip: req.ip,
    });
    res.status(500).json({ error: "获取用户信息失败", details: error.message });
  }
});

export default router;
