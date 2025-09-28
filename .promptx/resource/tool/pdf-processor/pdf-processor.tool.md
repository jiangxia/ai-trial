<tool>
<identity>
## 工具名称
@tool://pdf-processor

## 简介
PDF文件处理工具，支持文本提取、OCR识别扫描版PDF，并将结果保存为MD文件到原PDF文件目录
</identity>

<purpose>
⚠️ **AI重要提醒**: 调用此工具前必须完整阅读本说明书，理解工具功能边界、参数要求和使用限制。禁止在不了解工具功能的情况下盲目调用。

## 核心问题定义
解决PDF文件内容提取和格式转换问题，特别是处理扫描版PDF的OCR识别需求，同时确保输出文件保存在原PDF文件的目录中。

## 价值主张
- 🎯 **解决什么痛点**：PDF内容难以编辑和检索，扫描版PDF无法直接提取文本
- 🚀 **带来什么价值**：将PDF内容转换为可编辑的Markdown格式，提升文档处理效率
- 🌟 **独特优势**：智能识别PDF类型，自动选择最佳处理方案，支持OCR识别扫描版文档

## 应用边界
- ✅ **适用场景**：文本型PDF提取、扫描版PDF OCR识别、PDF内容转换为Markdown
- ❌ **不适用场景**：图像密集型PDF、加密PDF、超大文件（>50MB）、音视频嵌入PDF
</purpose>

<usage>
## 使用时机
- 需要将PDF内容转换为可编辑格式时
- 处理扫描版PDF需要OCR识别时
- 批量处理PDF文件提取内容时

## 操作步骤
1. **准备阶段**：确保PDF文件路径正确，检查文件大小和格式
2. **执行阶段**：工具自动识别PDF类型并选择合适的处理方案
3. **验证阶段**：检查生成的MD文件内容完整性和准确性

## 最佳实践
- 🎯 **效率提升**：批量处理多个PDF文件时建议分批进行
- ⚠️ **避免陷阱**：确保PDF文件未损坏，避免处理超大文件
- 🔧 **故障排除**：OCR失败时可尝试调整图像质量参数

## 注意事项
- 文件大小限制：建议不超过50MB
- OCR识别准确率依赖于原图清晰度
- 处理时间根据文件大小和复杂度而定
</usage>

<parameter>
## 必需参数
| 参数名 | 类型 | 描述 | 示例 |
|--------|------|------|------|
| pdfPath | string | PDF文件的完整路径 | "/path/to/document.pdf" |

## 可选参数
| 参数名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| outputName | string | "提取内容" | 输出MD文件的名称（不含扩展名） |
| ocrLanguage | string | "chi_sim" | OCR识别语言（中文简体） |
| enableOCR | boolean | true | 是否启用OCR识别扫描版PDF |
| imageQuality | number | 300 | OCR图像DPI质量 |

## 参数约束
- **路径有效性**：pdfPath必须是有效的PDF文件路径
- **文件大小**：PDF文件大小不超过50MB
- **语言支持**：支持中文(chi_sim)和英文(eng)
- **质量范围**：imageQuality范围150-600DPI

## 参数示例
```json
{
  "pdfPath": "/Users/user/documents/report.pdf",
  "outputName": "报告内容",
  "ocrLanguage": "chi_sim",
  "enableOCR": true,
  "imageQuality": 300
}
```
</parameter>

<outcome>
## 成功返回格式
```json
{
  "success": true,
  "data": {
    "originalPath": "/Users/user/documents/report.pdf",
    "outputPath": "/Users/user/documents/报告内容.md",
    "pdfType": "scanned",
    "pageCount": 10,
    "processingTime": 15.5,
    "ocrUsed": true,
    "extractedText": "PDF内容摘要..."
  }
}
```

## 错误处理格式
```json
{
  "success": false,
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "PDF文件不存在",
    "details": "指定路径的PDF文件无法找到"
  }
}
```

## 结果解读指南
- **成功标识**：success字段为true表示处理成功
- **文件位置**：outputPath指向生成的MD文件位置
- **处理方式**：pdfType和ocrUsed表明使用的处理方法
- **质量评估**：通过pageCount和processingTime评估处理效果

## 后续动作建议
- 成功时：检查生成的MD文件内容，必要时手动校正
- 失败时：根据错误代码调整参数重试
- 优化建议：根据处理时间调整批量处理策略
</outcome>
</tool>