#!/bin/bash

# GitHub Pages 手動部署腳本
# 使用方法: ./deploy.sh

echo "🚀 開始部署到 GitHub Pages..."

# 檢查是否有未提交的變更
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  檢測到未提交的變更，請先提交或暫存變更"
    echo "執行: git add . && git commit -m 'your message'"
    exit 1
fi

# 生成靜態檔案
echo "📦 生成靜態檔案..."
pnpm generate

# 檢查生成是否成功
if [ ! -d "dist" ]; then
    echo "❌ 靜態檔案生成失敗"
    exit 1
fi

# 部署到 gh-pages 分支
echo "🌐 部署到 gh-pages 分支..."
pnpm run deploy

if [ $? -eq 0 ]; then
    echo "✅ 部署成功！"
    echo "🔗 您的網站將在幾分鐘後可在以下網址訪問："
    echo "   https://$(git config user.name).github.io/aidetect/"
else
    echo "❌ 部署失敗"
    exit 1
fi
