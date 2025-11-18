#!/bin/bash

# 生成自签名 SSL 证书的脚本

CERT_DIR="./certs"
KEY_FILE="$CERT_DIR/key.pem"
CERT_FILE="$CERT_DIR/cert.pem"

# 创建证书目录
mkdir -p "$CERT_DIR"

# 检查是否已存在证书
if [ -f "$KEY_FILE" ] && [ -f "$CERT_FILE" ]; then
    echo "⚠️  证书文件已存在"
    read -p "是否覆盖? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "已取消"
        exit 0
    fi
fi

# 生成私钥和证书
echo "正在生成自签名 SSL 证书..."
openssl req -x509 -newkey rsa:4096 -nodes \
    -keyout "$KEY_FILE" \
    -out "$CERT_FILE" \
    -days 365 \
    -subj "/C=CN/ST=State/L=City/O=Organization/CN=localhost"

if [ $? -eq 0 ]; then
    echo "✅ SSL 证书生成成功！"
    echo "   密钥文件: $KEY_FILE"
    echo "   证书文件: $CERT_FILE"
    echo ""
    echo "⚠️  注意: 这是自签名证书，仅用于开发环境"
    echo "   浏览器会显示安全警告，这是正常的"
    echo "   生产环境请使用由 CA 签发的正式证书"
else
    echo "❌ 证书生成失败"
    echo "   请确保已安装 openssl"
    exit 1
fi

