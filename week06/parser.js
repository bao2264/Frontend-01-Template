const css = require("css")

const EOF = Symbol("EOF")

let currentToken = null
let currentAttribute = null
let currentTextNode = null

let stack = [
  {
    type: "document",
    children: [],
  },
]

const _aZReg = /^[a-zA-Z\!]$/
const _tnfReg = /^[\t\n\f ]$/

const _endOr = (c) => c === "/" || c === ">" || c === EOF

let rules = []
function addCssRules(text) {
  var ast = css.parse(text)
  rules.push(...ast.stylesheet.rules)
}
function match(element, selector) {
  if (!selector || !element.attributes) {
    return false
  }

  if (selector.charAt(0) === "#") {
    const attr = element.attributes.filter((attr) => attr.name === "id")[0]
    if (attr && attr.value === selector.replace("#", "")) {
      return true
    } else if (selector.charAt(0) === ".") {
      const attr = element.attributes.filter((attr) => attr.name === "class")[0]
      if (attr && attr.value === selector.replace(".", "")) {
        return true
      }
    } else {
      if (element.tagName === selector) {
        return true
      }
    }
  }
}
function specificity(selector) {
  const p = [0, 0, 0, 0]
  const selectorParts = selector.split(" ")
  for (let part of selectorParts) {
    if (part.charAt(0) === "#") {
      p[1] += 1
    } else if (part.charAt(0) === ".") {
      p[2] += 1
    } else {
      p[3] += 1
    }
  }
  return p
}
function compare(sp1, sp2) {
  if (sp1[0] - sp2[0]) {
    return sp1[0] - sp2[0]
  }
  if (sp1[1] - sp2[1]) {
    return sp1[1] - sp2[1]
  }
  if (sp1[2] - sp2[2]) {
    return sp1[2] - sp2[2]
  }
  return sp1[3] - sp2[3]
}
function computeCss(element) {
  const elements = stack.slice().reverse()
  if (!element.computedStyle) {
    element.computedStyle = {}
  }

  for (let rule of rules) {
    const selectorParts = rule.selectors[0].split(" ").reverse()
    if (!match(element, selectorParts[0])) {
      continue
    }
    let matched = false
    let j = 1
    for (let i = 0; i < elements.length; i++) {
      if (match(elements[i], selectorParts[j])) {
        j++
      }
    }
    if (j >= selectorParts.length) {
      matched = true
    }
    if (matched) {
      const sp = specificity(rule.selectors[0])
      const computedStyle = element.computedStyle
      for (let declaration of rule.declarations) {
        if (!computedStyle[declaration.property]) {
          computedStyle[declaration.property] = {}
        }
        if (!computedStyle[declaration.property].specificity) {
          computedStyle[declaration.property].value = declaration.value
          computedStyle[declaration.property].specificity = sp
        } else if (
          compare(computedStyle[declaration.property].specificity, sp) < 0
        ) {
          computedStyle[declaration.property].value = declaration.value
          computedStyle[declaration.property].specificity = sp
        }
      }
    }
  }
}

function emit(token) {
  let top = stack[stack.length - 1]

  if (token.type === "startTag") {
    let element = {
      type: "element",
      children: [],
      attributes: [],
    }

    element.tagName = token.tagName

    for (let p in token) {
      if (p !== "type" && p !== "tagName") {
        element.attributes.push({
          name: p,
          value: token[p],
        })
      }
    }

    computeCss(element)

    top.children.push(element)

    if (!token.isSelfColsing) {
      stack.push(element)
    }

    currentTextNode = null
  } else if (token.type === "endTag") {
    if (top.tagName !== token.tagName) {
      throw new Error("Tag start end doesn't match")
    } else {
      if (top.tagName === "style") {
        addCssRules(top.children[0].content)
      }
      stack.pop()
    }
    currentTextNode = null
  } else if (token.type === "text") {
    if (currentTextNode == null) {
      currentTextNode = {
        type: "text",
        content: "",
      }
      top.children.push(currentTextNode)
    }
    currentTextNode.content += token.content
  }
}

function data(c) {
  if (c === "<") {
    return tagOpen
  } else if (c === EOF) {
    emit({ type: "EOF" })
    return
  } else {
    emit({ type: "text", content: c })
    return data
  }
}

function tagOpen(c) {
  if (c === "/") {
    return endTagOpen
  } else if (c.match(_aZReg)) {
    currentToken = {
      type: "startTag",
      tagName: "",
    }
    return tagName(c)
  } else {
    emit({
      type: "text",
      content: c,
    })
    return
  }
}

function tagName(c) {
  if (c.match(_tnfReg)) {
    return beforeAttributeName
  } else if (c === "/") {
    return selfClosingStartTag
  } else if (c.match(/^[A-Z]$/)) {
    currentToken.tagName += c
    return tagName
  } else if (c === ">") {
    emit(currentToken)
    return data
  } else {
    currentToken.tagName += c
    return tagName
  }
}

function beforeAttributeName(c) {
  if (c.match(_tnfReg)) {
    return beforeAttributeName
  } else if (_endOr(c)) {
    return afterAttributeName(c)
  } else if (c === "=") {
    // return beforeAttributeName
  } else {
    currentAttribute = {
      name: "",
      value: "",
    }
    return attributeName(c)
  }
}

function attributeName(c) {
  if (c.match(_tnfReg) || _endOr(c)) {
    return afterAttributeName(c)
  } else if (c === "=") {
    return beforeAttributeValue
  } else if (c === "\u0000") {
  } else if (c === '"' || c === "'" || c === "<") {
  } else {
    currentAttribute.name += c
    return attributeName
  }
}

function beforeAttributeValue(c) {
  if (c.match(_tnfReg) || _endOr(c)) {
    return beforeAttributeValue
  } else if (c === '"') {
    return doubleQuotedAttributeValue
  } else if (c === "'") {
    return singleQuotedAttributeValue
  } else if (c === ">") {
  } else {
    return UnQuotedAttributeValue(c)
  }
}

function doubleQuotedAttributeValue(c) {
  if (c === '"') {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterQuotedAttributeValue
  } else if (c === "\u0000") {
  } else if (c === EOF) {
  } else {
    currentAttribute.value += c
    return doubleQuotedAttributeValue
  }
}

function singleQuotedAttributeValue(c) {
  if (c === "'") {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterQuotedAttributeValue
  } else if (c === "\u0000") {
  } else if (c === EOF) {
  } else {
    currentAttribute.value += c
    return doubleQuotedAttributeValue
  }
}

function afterQuotedAttributeValue(c) {
  if (c.match(_tnfReg)) {
    return beforeAttributeName
  } else if (c === "/") {
    return selfClosingStartTag
  } else if (c === ">") {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (c === EOF) {
  } else {
    currentAttribute.value += c
    return doubleQuotedAttributeValue
  }
}

function UnQuotedAttributeValue(c) {
  if (c.match(_tnfReg)) {
    currentToken[currentAttribute.name] = currentAttribute.value
    return beforeAttributeName
  } else if (c === "/") {
    currentToken[currentAttribute.name] = currentAttribute.value
    return selfClosingStartTag
  } else if (c === ">") {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (c === "\u0000") {
  } else if (c === '"' || c === "'" || c === "<" || c === "=" || c === "`") {
  } else if (c === EOF) {
  } else {
    currentAttribute.value += c
    return UnQuotedAttributeValue
  }
}

function selfClosingStartTag(c) {
  if (c === ">") {
    currentToken.isSelfColsing = true
    emit(currentToken)
    return data
  } else if (c === EOF) {
  } else {
  }
}

function endTagOpen(c) {
  if (c.match(_aZReg)) {
    currentToken = {
      type: "endTag",
      tagName: "",
    }
    return tagName(c)
  } else if (c === ">") {
  } else if (c === EOF) {
  } else {
  }
}

function afterAttributeName(c) {
  if (c.match(_tnfReg)) {
    return afterAttributeName
  } else if (c === "/") {
    return selfClosingStartTag
  } else if (c === "=") {
    return beforeAttributeValue
  } else if (c === ">") {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (c === EOF) {
  } else {
    currentToken[currentAttribute.name] = currentAttribute.value
    currentAttribute = {
      name: "",
      value: "",
    }
    return attributeName(c)
  }
}

const parseHtml = (html) => {
  let state = data
  for (let c of html) {
    // console.log(c)
    state = state(c)
  }
  state = state(EOF)
  console.log(JSON.stringify(stack[0]))
  // console.log(JSON.stringify(rules))
}

module.exports = {
  parseHtml,
}