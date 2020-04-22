# 第二周作业

1. 正则匹配所有的数字直接量

```JavaScript
const isBinary = /^0[bB][01]+$/
const isOctal = /^0[oO][0-7]+$/
const isHex = /^0[xX][0-9a-fA-F]+$/
// todo 匹配十进制数
```

2. 写一个 utf8 encoding 函数

```JavaScript
function UTF8_Encoding(str) {
    const encode = encodeURIComponent(str)
    const bytes = []
    for (let i=0, len=encode.length; i<len; i++) {
        const char = encode.charAt(i)
        if (char === '%') {
            const hex = encode.charAt(i+1) + encode.charAt(i+2)
            const hexValue = parseInt(hex, 16)
            bytes.push(hexValue)
            i += 2
        } else {
            bytes.push(char.charCodeAt(0))
        }
    }
    return bytes
}
console.log(UTF8_Encoding('hanfengxiaose'))
console.log(UTF8_Encoding('寒风萧瑟'))
```

3. 正则匹配所有的字符串直接量，包含单引号和双引号

```JavaScript
// todo 不是很理解，是要匹配字符串中的任意字符？类似于这样 '\'als八连杀92*&%￥#"sks"\''
```
