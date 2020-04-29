# 第三周总结

### 表达式 Expressions

new.target 用来判断是否是用 new 生成
new Foo() 带括号的优先级高
new new foo() ---> new (new foo())

##### Reference 类型

##### 类型转换

|           | Number         | String           | Boolean  | Undefined | Null | Object | Symbol |
| --------- | -------------- | ---------------- | -------- | --------- | ---- | ------ | ------ |
| Number    | -              |                  | 0 false  | ×         | ×    | Boxing | ×      |
| String    |                | -                | “” false | ×         | ×    | Boxing | ×      |
| Boolean   | True 1 False 0 | ’true’ ‘false'   | -        | ×         | ×    | Boxing | ×      |
| Undefined | 0              | ‘Undefined'      | False    | -         | ×    | ×      | ×      |
| Null      | 0              | ’null'           | False    | ×         | -    | ×      | ×      |
| Object    | valueOf        | valueOf toString | True     | ×         | ×    | -      | ×      |
| Symbol    | ×              | ×                | ×        | ×         | ×    | Boxing | -      |

### Javascript 对象

所有内置对象可参考下面链接

- [Standard built-in objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects)
