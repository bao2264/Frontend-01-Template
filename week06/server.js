const http = require("http")

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "text/html")
  res.setHeader("X-Foo", "bjw")
  res.writeHead(200)
  res.end(
    `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <style>
          body div #myid {
            width: 100px;
            background-color: #ff5000;
          }
          body div img {
            width: 30px;
            background-color: #ff1111;
          }
        </style>
      </head>
      <body>
        <div>
          <img id="myid" />
          <img />
        </div>
      </body>
    </html>    
    `
  )
})

server.listen(3000)
