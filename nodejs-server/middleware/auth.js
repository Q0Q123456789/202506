import jwt from "jsonwebtoken";

// JWT 密钥
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

// 验证 JWT token 的中间件
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "未提供访问令牌" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "无效的访问令牌" });
    }
    req.user = user;
    next();
  });
};

// 生成 JWT token
export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
  );
};
