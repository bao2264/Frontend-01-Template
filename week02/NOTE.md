# 第二周总结

编程语言通识
语言按语法分类包含

- 非形式语言
  - 中文、英文
- 形式语言（乔姆斯基谱系）
  - 0 型 无限制文法 `(?::=?)`
  - 1 型 上下文相关文法 `(?<A>?::=?<B>?)`
  - 2 型 上下文无关文法 `(<A>::=?)`
  - 3 型 正则文法 `(<A>::=<A>?)`

学习形式语言前提需要学习**_产生式（BNF）_**

- 用尖括号括起来的名称来表示语法结构名
- 语法结构分成基础结构和需要用其他语法结构定义的复合结构
  - 基础结构称终结符
  - 复合结构称非终结符
- 引号和中间的字符表示终结符
- 可以有括号
- - 号表示重复多次
- | 表示或
- - 表示至少一次

```
<Number> ::= "0" | "1"... | "9"
<MultiplicativeExpression> ::= <Number> | <MultiplicativeExpression>"*"<Number> | <MultiplicativeExpression>"/"<Number>
```

图灵完备性

- 命令式 ---- 图灵机
  - goto
  - if 和 while
- 声明式 ---- lambda
  - 递归

类型系统

- 有隐式转换的可以归为弱类型

一般命令式编程语言包含:

- Atom (最小单位)
- Expression （表达式）
- Statement （语句）
- Structure （结构）
- Program （程序）

unicode 编码
