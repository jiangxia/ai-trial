<tool>
<identity>
## 工具名称
@tool://legal-dossier-analyzer

## 简介
法律卷宗智能分析工具，专门用于解析和分析法律案件卷宗PDF文件，提取关键信息并生成结构化摘要
</identity>

<purpose>
⚠️ **AI重要提醒**: 调用此工具前必须完整阅读本说明书，理解工具功能边界、参数要求和使用限制。禁止在不了解工具功能的情况下盲目调用。

## 核心问题定义
解决法律工作者在处理大量案件卷宗时面临的信息提取困难、结构分析复杂、关键信息定位耗时等问题。

## 价值主张
- 🎯 **解决什么痛点**：手动阅读卷宗耗时长、关键信息容易遗漏、案件结构不清晰
- 🚀 **带来什么价值**：提高案件分析效率80%，确保关键信息不遗漏，生成标准化分析报告
- 🌟 **独特优势**：专为中文法律文书设计，支持复杂卷宗结构解析，智能识别案件要素

## 应用边界
- ✅ **适用场景**：刑事案件卷宗、民事案件卷宗、行政案件卷宗、法律文书分析
- ❌ **不适用场景**：非法律文件、纯图片PDF、加密PDF、损坏的PDF文件
</purpose>

<usage>
## 使用时机
- 收到新的案件卷宗需要快速了解案情时
- 需要提取案件关键信息用于案件分析时
- 准备庭审材料需要整理卷宗结构时
- 需要生成案件摘要报告时

## 操作步骤
1. **准备阶段**：确保PDF文件完整可读，文件路径正确
2. **执行阶段**：
   - 指定PDF文件路径
   - 选择分析模式（快速分析/深度分析）
   - 设置输出格式（JSON/Markdown）
3. **验证阶段**：检查提取的信息是否准确完整

## 最佳实践
- 🎯 **效率提升**：优先使用快速分析模式获取概览，再根据需要进行深度分析
- ⚠️ **避免陷阱**：注意扫描版PDF可能需要OCR处理，影响分析精度
- 🔧 **故障排除**：如果分析失败，检查PDF是否损坏或包含特殊字符

## 注意事项
- 涉及敏感信息时注意数据安全
- 扫描版PDF分析精度可能降低
- 大文件分析需要较长时间，请耐心等待
- 分析结果仅供参考，重要决策需人工核实
</usage>

<parameter>
## 必需参数
| 参数名 | 类型 | 描述 | 示例 |
|--------|------|------|------|
| filePath | string | PDF文件的绝对路径 | "/path/to/dossier.pdf" |

## 可选参数
| 参数名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| analysisMode | string | "quick" | 分析模式：quick(快速)/deep(深度) |
| outputFormat | string | "json" | 输出格式：json/markdown |
| extractPages | array | [] | 指定提取页码范围，空数组表示全部 |
| enableOCR | boolean | false | 是否启用OCR识别扫描版PDF |
| ocrLanguage | string | "chi_sim" | OCR识别语言 |

## 参数约束
- **文件路径**：必须是有效的PDF文件路径，文件大小不超过500MB
- **分析模式**：只能是"quick"或"deep"
- **输出格式**：只能是"json"或"markdown"
- **页码范围**：必须是有效的页码数组，如[1,10]表示第1-10页
- **OCR语言**：支持chi_sim(简体中文)、chi_tra(繁体中文)、eng(英文)

## 参数示例
```json
{
  "filePath": "/Users/user/Documents/第二卷.pdf",
  "analysisMode": "deep",
  "outputFormat": "json",
  "extractPages": [1, 50],
  "enableOCR": true,
  "ocrLanguage": "chi_sim"
}
```
</parameter>

<outcome>
## 成功返回格式
```json
{
  "success": true,
  "data": {
    "caseInfo": {
      "caseNumber": "案件编号",
      "caseTitle": "案件名称",
      "caseType": "案件类型",
      "suspects": ["嫌疑人列表"],
      "filingDate": "立案日期",
      "agency": "办案单位"
    },
    "dossierStructure": {
      "totalPages": 232,
      "sections": [
        {
          "title": "立案决定书",
          "pages": "1",
          "type": "legal_document"
        }
      ]
    },
    "keyInformation": {
      "importantDates": ["关键日期"],
      "legalBasis": ["法律依据"],
      "evidenceList": ["证据清单"]
    },
    "summary": "案件摘要",
    "analysisTime": "2024-01-01T12:00:00Z"
  }
}
```

## 错误处理格式
```json
{
  "success": false,
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "指定的PDF文件不存在",
    "details": "请检查文件路径是否正确"
  }
}
```

## 结果解读指南
- **案件信息**：包含案件的基本识别信息，用于案件管理
- **卷宗结构**：展示PDF的章节结构，便于快速定位
- **关键信息**：提取的重要时间、法条、证据等核心要素
- **案件摘要**：AI生成的案件概要，适合快速了解案情

## 后续动作建议
- 成功时：可基于结构化信息进行深入分析或生成报告
- 失败时：检查文件完整性，必要时使用OCR模式重试
- 进一步处理：结合其他法律工具进行案件研究分析
</outcome>
</tool>