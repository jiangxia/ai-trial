#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
PDF转Markdown工具

此脚本用于将法律文书PDF文件转换为Markdown格式，
保留原始文档的结构和页码标记，适合模拟法庭系统使用。
"""

import os
import sys
import re
import fitz  # PyMuPDF
import argparse
from datetime import datetime


def create_directory_if_not_exists(directory):
    """创建目录（如果不存在）"""
    if not os.path.exists(directory):
        os.makedirs(directory)
        print(f"已创建目录: {directory}")


def detect_title(text, min_length=4, max_length=50):
    """检测可能的标题行

    标题特征:
    1. 长度适中（不太长也不太短）
    2. 不包含常见的段落标点如逗号、分号
    3. 可能以特定词汇开头（如"关于"、"第x条"等）
    """
    if min_length <= len(text) <= max_length:
        # 检查是否不含有常见段落内标点
        if "，" not in text and "；" not in text and "：" not in text:
            # 检查是否以标题常见词开头或结尾
            title_starters = ["关于", "第", "一、", "二、", "三、", "四、", "五、"]
            title_enders = ["的规定", "的意见", "的通知", "的决定"]

            for starter in title_starters:
                if text.startswith(starter):
                    return True

            for ender in title_enders:
                if text.endswith(ender):
                    return True

            # 检查是否全部为大写（可能是标题）
            if text.isupper():
                return True

            # 检查是否以"案号"、"案由"等关键词开头
            legal_keywords = ["案号", "案由", "原告", "被告", "审理法院"]
            for keyword in legal_keywords:
                if keyword in text:
                    return True

    return False


def pdf_to_markdown(pdf_path, output_path=None):
    """将PDF文件转换为Markdown格式"""

    # 如果未指定输出路径，则在相同目录下创建同名markdown文件
    if output_path is None:
        base_name = os.path.splitext(pdf_path)[0]
        output_path = f"{base_name}.md"

    # 打开PDF文件
    try:
        pdf_document = fitz.open(pdf_path)
    except Exception as e:
        print(f"无法打开PDF文件: {e}")
        return False

    # 准备Markdown内容
    markdown_content = []

    # 提取文件名（不含扩展名）作为标题
    file_name = os.path.basename(pdf_path)
    file_name_without_ext = os.path.splitext(file_name)[0]
    markdown_content.append(f"# {file_name_without_ext}\n")

    # 处理每一页
    for page_num in range(len(pdf_document)):
        # 获取页面
        page = pdf_document[page_num]

        try:
            # 提取文本 - 尝试直接调用page对象的text属性
            text = page.get_text()
        except AttributeError:
            # 如果上面的方法失败，尝试使用pymupdf.utils中的get_text函数
            from pymupdf.utils import get_text
            text = get_text(page)

        # 分割为行
        lines = text.split('\n')

        # 处理每一行
        for line in lines:
            line = line.strip()
            if not line:
                continue

            # 检测可能的标题并添加Markdown格式
            if detect_title(line):
                markdown_content.append(f"\n## {line}\n")
            else:
                # 普通文本段落处理
                markdown_content.append(f"{line}\n")

        # 添加页码标记
        page_mark = f"\n---\n\n*第 {page_num + 1} 页，共 {len(pdf_document)} 页*\n\n"
        markdown_content.append(page_mark)

    # 写入Markdown文件
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(''.join(markdown_content))
        print(f"已成功转换为Markdown: {output_path}")
        return True
    except Exception as e:
        print(f"写入Markdown文件时出错: {e}")
        return False


def batch_convert(input_dir, output_dir=None):
    """批量转换目录中的所有PDF文件"""
    # 如果未指定输出目录，则在输入目录下创建markdown子目录
    if output_dir is None:
        output_dir = os.path.join(input_dir, "markdown")

    # 确保输出目录存在
    create_directory_if_not_exists(output_dir)

    # 获取所有PDF文件
    pdf_files = [f for f in os.listdir(input_dir) if f.lower().endswith('.pdf')]

    if not pdf_files:
        print(f"在 {input_dir} 中未找到PDF文件")
        return

    # 转换每个文件
    success_count = 0
    for pdf_file in pdf_files:
        pdf_path = os.path.join(input_dir, pdf_file)
        output_file = os.path.splitext(pdf_file)[0] + ".md"
        output_path = os.path.join(output_dir, output_file)

        if pdf_to_markdown(pdf_path, output_path):
            success_count += 1

    print(f"批量转换完成: 共 {len(pdf_files)} 个文件，成功转换 {success_count} 个")


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="将PDF文件转换为Markdown格式")
    parser.add_argument("input", help="输入的PDF文件路径或包含PDF文件的目录")
    parser.add_argument("-o", "--output", help="输出的Markdown文件路径或目录")
    parser.add_argument("-b", "--batch", action="store_true", help="批量处理模式")

    args = parser.parse_args()

    if args.batch or os.path.isdir(args.input):
        # 批量处理模式
        batch_convert(args.input, args.output)
    else:
        # 单文件处理模式
        pdf_to_markdown(args.input, args.output)


if __name__ == "__main__":
    main()
