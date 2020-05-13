const net = require("net")

const BODY_FORM = "application/x-www-form-urlencoded"
const BODY_JSON = "application/json"

class Request {
  constructor(options = {}) {
    const {
      host,
      port = 80,
      path,
      method = "GET",
      body = {},
      headers = {},
    } = options
    this.host = host
    this.port = port
    this.path = path
    this.method = method
    this.body = body
    this.headers = headers
    if (!this.headers["Content-Type"]) {
      this.headers["Content-Type"] = BODY_FORM
    }
    if (this.headers["Content-Type"] === BODY_JSON) {
      this.bodyText = JSON.stringify(this.body)
    } else if (
      this.headers["Content-Type"] === BODY_FORM &&
      Object.keys(this.body).length
    ) {
      this.bodyText = Object.keys(this.body)
        .map((key) => `${key}=${encodeURIComponent(this.body[key])}`)
        .join("&")
    }
    if (this.bodyText) {
      this.headers["Content-Length"] = this.bodyText.length
    }
  }

  toString() {
    return `
${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers)
  .map((key) => key + ": " + this.headers[key])
  .join("\r\n")}
\r
${this.bodyText ? this.bodyText : ""}
    `
  }
  send(connection) {
    return new Promise((resolve, reject) => {
      const responseParser = new ResponseParser()
      if (!connection) {
        connection = new net.createConnection(
          {
            host: this.host,
            port: this.port,
          },
          () => {
            console.log(this.toString())
            connection.write(this.toString())
          }
        )
      } else {
        connection.write(this.toString())
      }
      connection.on("error", (err) => {
        reject(err)
        connection.end()
      })
      connection.on("data", (data) => {
        // resolve(data.toString())
        responseParser.receive(data.toString())
        // console.log(JSON.stringify(responseParser.statusLine))
        // console.log(responseParser.headers)
        if (responseParser.isFinished) {
          console.log(responseParser.response)
        }
        connection.end()
      })
    })
  }
}

// class Response {}

class ResponseParser {
  constructor() {
    // 定义状态
    // 处理响应行
    this.PROCESS_STATUS_LINE = 0
    this.PROCESS_STATUS_LINE_END = 1
    // 处理响应头
    this.PROCESS_HEADERS_BLOCK_END = 2
    this.PROCESS_HEADERS_LINE = 3
    this.PROCESS_HEADERS_LINE_END = 4
    // 处理响应体
    this.PROCESS_BODY = 5

    // 当前状态
    this.current = this.PROCESS_STATUS_LINE

    this.statusLine = ""
    this.headerLine = ""
    this.headers = {}
    this.body = null
  }
  get isFinished() {
    return this.body && this.body.isFinished
  }
  get response() {
    this.statusLine.match(/^HTTP\/1\.1 ([1-5]\d{2}) (\w+)/)
    return {
      statusCode: RegExp.$1,
      statusText: RegExp.$2,
      headers: this.headers,
      body: this.body ? this.body.content.join("") : null,
    }
  }
  receive(str) {
    for (let i = 0, len = str.length; i < len; i++) {
      this.receiveChar(str[i].charAt())
    }
  }
  receiveChar(char) {
    if (this.current === this.PROCESS_STATUS_LINE) {
      // 响应行状态处理
      if (char === "\r") {
        this.current = this.PROCESS_STATUS_LINE_END
      } else {
        this.statusLine += char
      }
    } else if (this.current === this.PROCESS_STATUS_LINE_END) {
      // 响应行结束处理
      this.current = this.PROCESS_HEADERS_LINE
    } else if (this.current === this.PROCESS_HEADERS_LINE) {
      // 响应头状态处理
      if (char === "\r") {
        if (this.headerLine === "") {
          this.current = this.PROCESS_HEADERS_BLOCK_END
        } else {
          const _colonIndex = this.headerLine.indexOf(":")
          this.headers[
            this.headerLine.substring(0, _colonIndex)
          ] = this.headerLine.substring(_colonIndex + 1).trim()
          this.headerLine = ""
          this.current = this.PROCESS_HEADERS_LINE_END
        }
      } else {
        this.headerLine += char
      }
    } else if (this.current === this.PROCESS_HEADERS_LINE_END) {
      this.current = this.PROCESS_HEADERS_LINE
    } else if (this.current === this.PROCESS_HEADERS_BLOCK_END) {
      if (char === "\n") {
        this.current = this.PROCESS_BODY
      }
    } else if (this.current === this.PROCESS_BODY) {
      // 处理响应体
      // console.log(JSON.stringify(char))
      // const bodyParser = new ChunkBodyParser()
      // bodyParser.receive(char)
      // console.log(bodyParser.content)
      if (!this.body) {
        this.body = new ChunkBodyParser()
      }
      this.body.receive(char)
    }
  }
}

class ChunkBodyParser {
  constructor() {
    // 定义状态
    this.PROCESS_CONTENT_LENGTH = 0
    this.PROCESS_CONTENT_LENGTH_END = 1
    this.PROCESS_CONTENT = 2
    this.PROCESS_CONTENT_END = 3
    this.PROCESS_CONTENT_BLOCK_END = 4

    this.current = this.PROCESS_CONTENT_LENGTH
    this.content = []
    this.chunkLength = ""
    this.isFinished = false
  }
  receive(char) {
    if (this.current === this.PROCESS_CONTENT_LENGTH) {
      // 处理chunk length
      if (char === "0") {
        this.current = this.PROCESS_CONTENT_BLOCK_END
      } else {
        if (char === "\r") {
          this.chunkLength = parseInt(`0x${this.chunkLength}`, 16)
          console.log("1", this.chunkLength)
          this.current = this.PROCESS_CONTENT_LENGTH_END
          return
        } else {
          this.chunkLength += char
        }
      }
    } else if (this.current === this.PROCESS_CONTENT_LENGTH_END) {
      if (char === "\n") {
        this.current = this.PROCESS_CONTENT
      }
    } else if (this.current === this.PROCESS_CONTENT) {
      if (char === "\r") {
        this.current = this.PROCESS_CONTENT_END
      } else {
        this.content.push(char)
        console.log(char)
      }
    } else if (this.current === this.PROCESS_CONTENT_END) {
      if (char === "0") {
        this.current = this.PROCESS_CONTENT_BLOCK_END
      } else {
        this.current = this.PROCESS_CONTENT_LENGTH
      }
    } else if (this.current === this.PROCESS_CONTENT_BLOCK_END) {
      // 结束解析
      // console.log("aaa", this.content)
      this.isFinished = true
    }
  }
}

const request = new Request({
  method: "POST",
  host: "localhost",
  port: 3000,
  path: "/",
  body: {
    name: "winter",
  },
  // headers: {
  //   "Content-Type": "text/plain",
  // },
})
request.send().then((res) => console.log(JSON.stringify(res)))
