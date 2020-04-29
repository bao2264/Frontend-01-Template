# 第三周作业

完善 covertStringToNumber 函数

```Javascript
function convertStringToNumber(string, hex = 10) {
    const _zeroCode = '0'.codePointAt()
    const _arr = string.split('')
    const _dotIndex = string.indexOf('.')
    let num = 0, decimal = 1
    if (_dotIndex !== -1) {
        // 处理整数部分
        for (let i = 0, len = _arr.slice(0, _dotIndex).length; i < len; i++) {
            const _char = _arr[i]
            num = num * hex
            num += _char.codePointAt() - _zeroCode
        }
        // 处理小数部分
        if (_dotIndex !== -1) {
            const _tmp = _arr.slice(_dotIndex + 1)
            for (let i = 0; i < _tmp.length; i++) {
                decimal = decimal / hex
                num += (_tmp[i].codePointAt() - _zeroCode) * decimal
            }
        }
    } else {
        // 处理整数部分
        for (let i = 0, len = _arr.length; i < len; i++) {
            const _char = _arr[i]
            num = num * hex
            num += _char.codePointAt() - _zeroCode
        }
    }
    return num
}
```

完善 convertNumberToString 函数

```JavaScript
function convertNumberToString(number, hex = 10) {
  let integer = Math.floor(number)
  let decimal = number - integer
  let string = ''
  while(integer > 0) {
    string = (integer % hex) + string
    integer = Math.floor(integer / hex)
  }
  return string
}
```
