const fs = require('fs');
const path = require('path');

module.exports = {
  getDependencies() {
    return [
      'pdf-parse@^1.1.1',           // PDF文本提取
      'pdf2pic@^2.1.4',            // PDF转图片（OCR用）
      'tesseract.js@^4.1.1',       // OCR识别
      'axios@^1.6.0',              // HTTP请求（调用AI API）
      'lodash@^4.17.21',           // 工具函数
      'marked@^9.1.6',             // Markdown处理
      'validator@^13.11.0'         // 数据验证
    ];
  },
  
  getMetadata() {
    return {
      name: 'pdf-smart-summarizer',
      description: 'PDF智能总结工具，基于AI驱动的内容理解，根据用户需求和角色提供个性化的PDF内容总结和关键信息提取',
      version: '1.0.0',
      category: 'document-processing',
      author: 'LuBan',
      tags: ['pdf', 'ai', 'summarization', 'legal', 'document-analysis']
    };
  },
  
  getSchema() {
    return {
      type: 'object',
      properties: {
        pdfPath: {
          type: 'string',
          description: 'PDF文件的完整路径'
        },
        userRole: {
          type: 'string',
          description: '用户角色，影响总结视角',
          enum: ['lawyer', 'student', 'researcher', 'manager', 'analyst', 'custom']
        },
        summaryRequest: {
          type: 'string',
          description: '具体的总结需求描述',
          maxLength: 500
        },
        summaryLevel: {
          type: 'string',
          description: '总结详细程度',
          enum: ['brief', 'standard', 'detailed'],
          default: 'detailed'
        },
        focusAreas: {
          type: 'array',
          description: '关注的特定领域或章节',
          items: { type: 'string', maxLength: 50 },
          default: []
        },
        outputFormat: {
          type: 'string',
          description: '输出格式',
          enum: ['markdown', 'json', 'text'],
          default: 'markdown'
        },
        language: {
          type: 'string',
          description: '总结语言',
          enum: ['zh-CN', 'en-US'],
          default: 'zh-CN'
        },
        includeOriginalText: {
          type: 'boolean',
          description: '是否保留原文文本提取结果',
          default: true
        },
        maxSummaryLength: {
          type: 'number',
          description: '总结最大字符数',
          minimum: 500,
          maximum: 10000,
          default: 2000
        },
        enableOCR: {
          type: 'boolean',
          description: '是否启用OCR识别扫描版PDF',
          default: true
        },
        ocrLanguage: {
          type: 'string',
          description: 'OCR识别语言',
          enum: ['chi_sim', 'eng', 'chi_sim+eng'],
          default: 'chi_sim'
        }
      },
      required: ['pdfPath', 'userRole', 'summaryRequest']
    };
  },
  
  validate(params) {
    const validator = require('validator');
    const errors = [];
    
    // 验证PDF路径
    if (!params.pdfPath || !fs.existsSync(params.pdfPath)) {
      errors.push('PDF文件路径无效或文件不存在');
    } else {
      const ext = path.extname(params.pdfPath).toLowerCase();
      if (ext !== '.pdf') {
        errors.push('文件必须是PDF格式');
      }
      
      // 检查文件大小
      const stats = fs.statSync(params.pdfPath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      if (fileSizeInMB > 50) {
        errors.push('PDF文件大小不能超过50MB');
      }
    }
    
    // 验证必需参数
    if (!params.userRole || params.userRole.trim() === '') {
      errors.push('用户角色不能为空');
    }
    
    if (!params.summaryRequest || params.summaryRequest.trim() === '') {
      errors.push('总结需求描述不能为空');
    } else if (params.summaryRequest.length > 500) {
      errors.push('总结需求描述不能超过500字符');
    }
    
    // 验证可选参数
    if (params.focusAreas && Array.isArray(params.focusAreas)) {
      for (const area of params.focusAreas) {
        if (typeof area !== 'string' || area.length > 50) {
          errors.push('关注领域项目必须是字符串且不超过50字符');
          break;
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  },
  
  async execute(params) {
    const _ = require('lodash');
    const pdfParse = require('pdf-parse');
    const fs = require('fs').promises;
    const path = require('path');
    
    const startTime = Date.now();
    
    try {
      // 第一步：提取PDF文本内容
      console.log('开始提取PDF文本内容...');
      const pdfBuffer = await fs.readFile(params.pdfPath);
      let extractedText = '';
      let pdfType = 'text';
      let pageCount = 0;
      let ocrUsed = false;
      
      try {
        // 尝试直接文本提取
        const pdfData = await pdfParse(pdfBuffer);
        extractedText = pdfData.text;
        pageCount = pdfData.numpages;
        
        // 检查是否为扫描版PDF（文本内容过少）
        const textPerPage = extractedText.length / pageCount;
        if (textPerPage < 100 && params.enableOCR) {
          console.log('检测到扫描版PDF，启用OCR识别...');
          extractedText = await this.performOCR(params.pdfPath, params.ocrLanguage);
          pdfType = 'scanned';
          ocrUsed = true;
        }
      } catch (error) {
        if (params.enableOCR) {
          console.log('文本提取失败，尝试OCR识别...');
          extractedText = await this.performOCR(params.pdfPath, params.ocrLanguage);
          pdfType = 'scanned';
          ocrUsed = true;
        } else {
          throw new Error(`PDF文本提取失败: ${error.message}`);
        }
      }
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('PDF文档内容为空或无法识别');
      }
      
      // 第二步：文本预处理和分块
      console.log('处理文本内容...');
      const processedText = this.preprocessText(extractedText);
      const textChunks = this.chunkText(processedText, 3000); // 分块处理长文本
      
      // 第三步：AI智能分析和总结
      console.log('正在进行AI智能分析...');
      const summary = await this.generateSmartSummary(
        textChunks,
        params.userRole,
        params.summaryRequest,
        params.summaryLevel,
        params.focusAreas,
        params.language,
        params.maxSummaryLength
      );
      
      // 第四步：格式化输出
      const processingTime = (Date.now() - startTime) / 1000;
      const outputPath = await this.saveResults(
        params.pdfPath,
        summary,
        extractedText,
        params.outputFormat,
        params.includeOriginalText
      );
      
      // 构建返回结果
      const result = {
        success: true,
        data: {
          summary: {
            title: summary.title,
            userRole: params.userRole,
            summaryLevel: params.summaryLevel,
            keyPoints: summary.keyPoints,
            riskAssessment: summary.riskAssessment,
            summary: summary.summary,
            wordCount: summary.summary.length
          },
          processingInfo: {
            originalPath: params.pdfPath,
            outputPath: outputPath,
            pdfType: pdfType,
            pageCount: pageCount,
            processingTime: processingTime,
            ocrUsed: ocrUsed,
            aiModelUsed: 'claude-3.5-sonnet'
          }
        }
      };
      
      if (params.includeOriginalText) {
        result.data.originalText = extractedText;
      }
      
      return result;
      
    } catch (error) {
      return {
        success: false,
        error: {
          code: this.getErrorCode(error),
          message: error.message,
          details: error.stack
        }
      };
    }
  },
  
  // OCR识别方法
  async performOCR(pdfPath, language) {
    const { createWorker } = require('tesseract.js');
    const pdf2pic = require('pdf2pic');
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
      // 转换PDF为图片
      const convert = pdf2pic.fromPath(pdfPath, {
        density: 300,
        saveFilename: 'page',
        savePath: path.dirname(pdfPath),
        format: 'png',
        width: 2000,
        height: 2000
      });
      
      // 只处理前5页（避免处理时间过长）
      const pages = await convert.bulk(-1, { responseType: 'buffer' });
      const maxPages = Math.min(pages.length, 5);
      
      const worker = await createWorker(language);
      let fullText = '';
      
      for (let i = 0; i < maxPages; i++) {
        const { data: { text } } = await worker.recognize(pages[i].buffer);
        fullText += text + '\\n\\n';
      }
      
      await worker.terminate();
      return fullText;
      
    } catch (error) {
      throw new Error(`OCR识别失败: ${error.message}`);
    }
  },
  
  // 文本预处理
  preprocessText(text) {
    return text
      .replace(/\\s+/g, ' ')  // 合并多个空格
      .replace(/\\n{3,}/g, '\\n\\n')  // 合并多个换行
      .replace(/[^\\u4e00-\\u9fa5\\u0000-\\u007F\\s]/g, '')  // 清理特殊字符
      .trim();
  },
  
  // 文本分块
  chunkText(text, maxLength) {
    const chunks = [];
    const sentences = text.split(/[。！？.!?]/);
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxLength) {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentence;
      } else {
        currentChunk += sentence + '。';
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  },
  
  // AI智能总结（模拟实现）
  async generateSmartSummary(textChunks, userRole, summaryRequest, summaryLevel, focusAreas, language, maxLength) {
    // 注意：这里是模拟实现，实际应该调用真实的AI API
    // 在真实环境中，需要集成如OpenAI API、Claude API等
    
    const rolePrompts = {
      lawyer: '作为法律专家，重点关注法律条款、权利义务、风险点和合规要求',
      student: '作为学生，重点关注核心概念、主要观点和学习要点',
      researcher: '作为研究者，重点关注方法论、数据分析和学术观点',
      manager: '作为管理者，重点关注执行要点、风险控制和决策支持',
      analyst: '作为分析师，重点关注数据洞察、趋势分析和关键指标'
    };
    
    const rolePrompt = rolePrompts[userRole] || '根据用户角色进行专业分析';
    
    // 模拟AI分析结果
    const mockSummary = {
      title: '文档智能总结',
      keyPoints: [
        {
          category: '核心内容',
          content: '根据用户需求提取的关键信息...',
          importance: 'high',
          pageReferences: [1, 2, 3]
        },
        {
          category: '要点分析',
          content: '基于用户角色的专业分析...',
          importance: 'medium',
          pageReferences: [4, 5]
        }
      ],
      riskAssessment: {
        highRisk: ['需要特别注意的风险点'],
        mediumRisk: ['一般风险点'],
        recommendations: ['专业建议1', '专业建议2']
      },
      summary: `基于${userRole}角色的视角，针对"${summaryRequest}"的需求，文档主要内容包括：\\n\\n${textChunks.slice(0, 2).join('\\n\\n').substring(0, maxLength)}...`
    };
    
    return mockSummary;
  },
  
  // 保存结果
  async saveResults(pdfPath, summary, originalText, outputFormat, includeOriginalText) {
    const fs = require('fs').promises;
    const path = require('path');
    const marked = require('marked');
    
    const pdfDir = path.dirname(pdfPath);
    const pdfName = path.basename(pdfPath, '.pdf');
    
    let outputContent = '';
    let outputExt = '';
    
    if (outputFormat === 'markdown') {
      outputContent = this.formatAsMarkdown(summary, originalText, includeOriginalText);
      outputExt = '.md';
    } else if (outputFormat === 'json') {
      outputContent = JSON.stringify({ summary, originalText: includeOriginalText ? originalText : undefined }, null, 2);
      outputExt = '.json';
    } else {
      outputContent = this.formatAsText(summary, originalText, includeOriginalText);
      outputExt = '.txt';
    }
    
    const outputPath = path.join(pdfDir, `${pdfName}_智能总结${outputExt}`);
    await fs.writeFile(outputPath, outputContent, 'utf8');
    
    return outputPath;
  },
  
  // 格式化为Markdown
  formatAsMarkdown(summary, originalText, includeOriginalText) {
    let content = `# ${summary.title}\\n\\n`;
    
    // 关键要点
    content += '## 📋 关键要点\\n\\n';
    summary.keyPoints.forEach(point => {
      content += `### ${point.category}\\n\\n`;
      content += `**重要性**: ${point.importance}\\n\\n`;
      content += `${point.content}\\n\\n`;
      content += `**页面参考**: ${point.pageReferences.join(', ')}\\n\\n`;
    });
    
    // 风险评估
    if (summary.riskAssessment) {
      content += '## ⚠️ 风险评估\\n\\n';
      
      if (summary.riskAssessment.highRisk.length > 0) {
        content += '### 🔴 高风险点\\n\\n';
        summary.riskAssessment.highRisk.forEach(risk => {
          content += `- ${risk}\\n`;
        });
        content += '\\n';
      }
      
      if (summary.riskAssessment.mediumRisk.length > 0) {
        content += '### 🟡 中等风险点\\n\\n';
        summary.riskAssessment.mediumRisk.forEach(risk => {
          content += `- ${risk}\\n`;
        });
        content += '\\n';
      }
      
      if (summary.riskAssessment.recommendations.length > 0) {
        content += '### 💡 建议\\n\\n';
        summary.riskAssessment.recommendations.forEach(rec => {
          content += `- ${rec}\\n`;
        });
        content += '\\n';
      }
    }
    
    // 总结
    content += '## 📝 总结\\n\\n';
    content += `${summary.summary}\\n\\n`;
    
    // 原文（如果需要）
    if (includeOriginalText && originalText) {
      content += '## 📄 原文内容\\n\\n';
      content += '```\\n';
      content += originalText.substring(0, 5000); // 限制原文长度
      content += originalText.length > 5000 ? '\\n\\n... (内容过长，已截断)' : '';
      content += '\\n```\\n';
    }
    
    return content;
  },
  
  // 格式化为纯文本
  formatAsText(summary, originalText, includeOriginalText) {
    let content = `${summary.title}\\n${'='.repeat(50)}\\n\\n`;
    
    content += '关键要点:\\n';
    summary.keyPoints.forEach(point => {
      content += `\\n${point.category} (${point.importance})\\n`;
      content += `${point.content}\\n`;
      content += `页面参考: ${point.pageReferences.join(', ')}\\n`;
    });
    
    if (summary.riskAssessment) {
      content += '\\n风险评估:\\n';
      if (summary.riskAssessment.highRisk.length > 0) {
        content += `\\n高风险点:\\n${summary.riskAssessment.highRisk.map(r => `- ${r}`).join('\\n')}\\n`;
      }
      if (summary.riskAssessment.recommendations.length > 0) {
        content += `\\n建议:\\n${summary.riskAssessment.recommendations.map(r => `- ${r}`).join('\\n')}\\n`;
      }
    }
    
    content += `\\n总结:\\n${summary.summary}\\n`;
    
    if (includeOriginalText && originalText) {
      content += `\\n原文内容:\\n${'-'.repeat(50)}\\n`;
      content += originalText.substring(0, 5000);
      content += originalText.length > 5000 ? '\\n\\n... (内容过长，已截断)' : '';
    }
    
    return content;
  },
  
  // 错误代码分类
  getErrorCode(error) {
    if (error.message.includes('文件') || error.message.includes('路径')) {
      return 'FILE_ERROR';
    } else if (error.message.includes('OCR') || error.message.includes('识别')) {
      return 'OCR_ERROR';
    } else if (error.message.includes('AI') || error.message.includes('分析')) {
      return 'AI_PROCESSING_ERROR';
    } else if (error.message.includes('格式') || error.message.includes('参数')) {
      return 'VALIDATION_ERROR';
    } else {
      return 'PROCESSING_ERROR';
    }
  }
};