# 智能模拟法庭 - 角色管理系统

## 设计理念

### 角色与实例分离
- **角色定义**：在 `.promptx` 中定义通用的专业角色（如 lawyer、judge、clerk）
- **角色实例**：在具体庭审中，同一角色可以有多个独立的实例
- **身份绑定**：每个角色实例通过动态身份设定绑定到具体的委托人或职责

## 核心角色

### 1. 律师角色 (lawyer)
- **角色ID**: `lawyer`
- **实例化方式**: 动态委托人绑定
- **激活方式**: `promptx_action("lawyer")` + 委托人身份设定

#### 律师实例示例
```
原告律师实例：
- 角色：lawyer
- 委托人：原告李某
- 材料来源：案件/原告/ 文件夹
- 职责：维护原告利益

被告一律师实例：
- 角色：lawyer  
- 委托人：被告何某
- 材料来源：案件/被告一/ 文件夹
- 职责：维护被告一利益

被告二律师实例：
- 角色：lawyer
- 委托人：被告施工方
- 材料来源：案件/被告二/ 文件夹  
- 职责：维护被告二利益
```

### 2. 法官角色 (judge)
- **角色ID**: `judge`
- **实例化方式**: 单一实例
- **激活方式**: `promptx_action("judge")`

### 3. 书记员角色 (clerk)
- **角色ID**: `clerk`
- **实例化方式**: 单一实例
- **激活方式**: `promptx_action("clerk")`

## 动态身份设定机制

### 律师身份设定流程
1. **角色激活**: `promptx_action("lawyer")`
2. **身份声明**: 明确当前代理的委托人
3. **材料绑定**: 自动关联委托人文件夹中的材料
4. **立场确定**: 基于委托人利益确定发言立场

### 身份设定模板
```
[当前角色：律师 - 代理{委托人名称}]
我是{委托人名称}的代理律师，基于委托人的{诉讼目标/答辩立场}，现就{具体问题}发表如下意见：
{具体论证内容}
```

## 角色切换规则

### 强制角色激活原则
1. **每次发言前必须激活对应角色**
2. **律师角色必须同时设定委托人身份**
3. **禁止跨角色发言或代为发言**
4. **角色激活失败时必须重新激活**

### 角色激活清单
| 发言人 | 激活命令 | 身份设定 |
|--------|----------|----------|
| 原告律师 | `promptx_action("lawyer")` | 代理原告{姓名} |
| 被告一律师 | `promptx_action("lawyer")` | 代理被告{姓名} |
| 被告二律师 | `promptx_action("lawyer")` | 代理被告{姓名} |
| 被告三律师 | `promptx_action("lawyer")` | 代理被告{姓名} |
| 法官 | `promptx_action("judge")` | 无需额外设定 |
| 书记员 | `promptx_action("clerk")` | 无需额外设定 |

## 角色边界控制

### 律师职业操守
- **专一性**：每个律师实例只能代理一个委托人
- **忠诚性**：必须维护委托人的合法权益
- **独立性**：不得为其他当事人提供建议
- **保密性**：不得泄露委托人的内部材料

### 角色冲突防范
- **材料隔离**：律师只能访问自己委托人的材料
- **立场明确**：每次发言必须明确代理身份
- **利益冲突检查**：禁止同时代理利益冲突的当事人

## 实施要求

### 系统执行规则
1. **角色激活验证**：每次发言前检查角色激活状态
2. **身份设定检查**：律师角色必须完成委托人身份设定
3. **材料访问控制**：基于角色身份限制材料访问范围
4. **发言内容审核**：确保发言符合角色立场和职业操守

### 错误处理机制
- **角色不存在**：使用 `promptx_init` 刷新角色注册表
- **身份设定缺失**：提示完成委托人身份设定
- **角色冲突**：强制重新激活正确角色
- **材料访问越权**：限制访问并提示权限错误

## 优势分析

### 1. 架构简洁
- 只需维护少量通用角色定义
- 避免为每个当事人创建专门角色
- 角色管理成本低，扩展性强

### 2. 逻辑清晰  
- 角色与实例分离，概念明确
- 动态身份绑定，灵活性高
- 职责边界清楚，避免混乱

### 3. 专业性强
- 符合真实法庭的律师执业模式
- 保证律师的专业操守和职业道德
- 确保庭审的公正性和对抗性

### 4. 可扩展性
- 新增当事人时无需创建新角色
- 支持复杂案件的多方当事人结构
- 便于系统功能的持续优化