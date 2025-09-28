<tool>
<identity>
## 工具名称
@tool://pdf-smart-summarizer

## 简介
PDF智能总结工具，基于AI驱动的内容理解，根据用户需求和角色提供个性化的PDF内容总结和关键信息提取
</identity>

<purpose>
⚠️ **AI重要提醒**: 调用此工具前必须完整阅读本说明书，理解工具功能边界、参数要求和使用限制。禁止在不了解工具功能的情况下盲目调用。

## 核心问题定义
解决大型PDF文档阅读耗时、关键信息定位困难的问题，特别是针对法律文件、学术论文、商业报告等专业文档，提供基于用户需求的智能内容总结和关键信息提取。

## 价值主张
- 🎯 **解决什么痛点**：大型PDF文档阅读耗时，关键信息散布在长篇内容中难以快速定位
- 🚀 **带来什么价值**：将数小时的文档阅读时间压缩到几分钟的关键信息获取，提升工作效率10-50倍
- 🌟 **独特优势**：基于用户角色和具体需求的个性化总结，支持法律、学术、商业等多种专业领域

## 应用边界
- ✅ **适用场景**：法律文件分析、合同审查、案例研究、学术论文总结、商业报告分析、政策文件解读
- ❌ **不适用场景**：需要逐字逐句精确理解的场景（如合同最终确认）、图表密集型文档、音视频嵌入文档
</purpose>

<usage>
## 使用时机
- 需要快速了解大型PDF文档核心内容时
- 根据特定需求从文档中提取关键信息时
- 对专业文档进行角色化分析时（如律师视角、学者视角等）
- 需要对多个相关文档进行对比分析时

## 操作步骤
1. **准备阶段**：确认PDF文件路径，明确总结需求和用户角色
2. **文档处理阶段**：工具自动进行文本提取或OCR识别
3. **智能分析阶段**：AI对文档内容进行理解和结构化分析
4. **个性化总结阶段**：基于用户需求生成定制化总结内容
5. **验证阶段**：检查总结内容的准确性和完整性

## 最佳实践
- 🎯 **效率提升**：明确描述您的角色和具体需求，如"作为律师，我需要了解这份合同的核心条款和风险点"
- ⚠️ **避免陷阱**：不要期望工具处理超过100页的超大文档，建议分段处理
- 🔧 **故障排除**：如果总结过于简略，可以调整详细程度参数或细化需求描述

## 注意事项
- 文档大小建议不超过50MB，页数不超过100页
- 总结准确性依赖于原文质量和OCR识别准确度
- 敏感信息处理需谨慎，建议在安全环境中使用
- 总结结果仅供参考，重要决策需结合原文验证
</usage>

<parameter>
## 必需参数
| 参数名 | 类型 | 描述 | 示例 |
|--------|------|------|------|
| pdfPath | string | PDF文件的完整路径 | "/path/to/document.pdf" |
| userRole | string | 用户角色，影响总结视角 | "lawyer", "student", "researcher", "manager" |
| summaryRequest | string | 具体的总结需求描述 | "提取合同中的关键条款和风险点" |

## 可选参数
| 参数名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| summaryLevel | string | "detailed" | 总结详细程度：brief/standard/detailed |
| focusAreas | array | [] | 关注的特定领域或章节 |
| outputFormat | string | "markdown" | 输出格式：markdown/json/text |
| language | string | "zh-CN" | 总结语言：zh-CN/en-US |
| includeOriginalText | boolean | true | 是否保留原文文本提取结果 |
| maxSummaryLength | number | 2000 | 总结最大字符数 |
| enableOCR | boolean | true | 是否启用OCR识别扫描版PDF |
| ocrLanguage | string | "chi_sim" | OCR识别语言 |

## 参数约束
- **路径有效性**：pdfPath必须是有效的PDF文件路径
- **文件大小**：PDF文件大小不超过50MB
- **角色限制**：userRole支持预定义角色或自定义角色描述
- **长度限制**：summaryRequest不超过500字符
- **数组格式**：focusAreas为字符串数组，每个元素不超过50字符

## 参数示例
```json
{
  "pdfPath": "/Users/lawyer/documents/contract.pdf",
  "userRole": "lawyer",
  "summaryRequest": "分析这份合同的核心条款、双方权利义务、违约责任和潜在风险点",
  "summaryLevel": "detailed",
  "focusAreas": ["付款条款", "违约责任", "争议解决"],
  "outputFormat": "markdown",
  "language": "zh-CN",
  "maxSummaryLength": 3000,
  "includeOriginalText": true
}
```
</parameter>

<outcome>
## 成功返回格式
```json
{
  "success": true,
  "data": {
    "summary": {
      "title": "文档标题",
      "userRole": "lawyer",
      "summaryLevel": "detailed",
      "keyPoints": [
        {
          "category": "核心条款",
          "content": "主要条款内容...",
          "importance": "high",
          "pageReferences": [1, 3, 5]
        }
      ],
      "riskAssessment": {
        "highRisk": ["潜在风险点1", "潜在风险点2"],
        "mediumRisk": ["注意事项1"],
        "recommendations": ["建议1", "建议2"]
      },
      "summary": "整体总结内容...",
      "wordCount": 2850
    },
    "processingInfo": {
      "originalPath": "/Users/lawyer/documents/contract.pdf",
      "outputPath": "/Users/lawyer/documents/contract_summary.md",
      "pdfType": "text",
      "pageCount": 25,
      "processingTime": 45.2,
      "ocrUsed": false,
      "aiModelUsed": "gpt-4"
    },
    "originalText": "原文提取内容..."
  }
}
```

## 错误处理格式
```json
{
  "success": false,
  "error": {
    "code": "PROCESSING_ERROR",
    "message": "PDF内容处理失败",
    "details": "文档内容过于复杂，建议分段处理"
  }
}
```

## 结果解读指南
- **总结质量评估**：通过keyPoints的详细程度和pageReferences的准确性判断
- **风险评估使用**：riskAssessment提供专业角度的风险分析，需结合原文验证
- **页面定位**：pageReferences帮助快速定位原文相关内容
- **处理效率**：processingTime反映文档复杂度，可用于优化后续处理策略

## 后续动作建议
- 成功时：基于summary进行进一步分析或决策，必要时查阅pageReferences指向的原文
- 失败时：根据错误代码调整参数，如拆分大文档、调整总结级别等
- 优化建议：根据处理时间和结果质量调整参数，建立个人使用模板
</outcome>
</tool>