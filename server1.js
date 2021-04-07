const express = require('express')
const path = require('path')
const multer = require('multer')
const fs = require('fs')
let timer = null
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 新增目录存放文件
        const chunksPath = path.join('public/upload', file.originalname.split('.')[0]);
        if (!fs.existsSync(chunksPath)) {
            fs.mkdirSync(chunksPath, { recursive: true }); // 新建文件夹
        }

        // 配置文件保存路径
        cb(null, path.join('public/upload', file.originalname.split('.')[0]))

        // 合并文件并删除目录
        clearTimeout(timer)
        timer = setTimeout(async () => {
            // 合并文件（获取子文件名称）
            await fs.readdir(chunksPath, (err, files) => {
                if (err) throw err
                files.map((res) => {
                    // 同步合并文件
                    fs.appendFileSync(
                        `public/upload/${file.originalname.split('.')[0]}.${file.originalname.split('.')[2]}`,
                        fs.readFileSync(path.join(chunksPath, res)), // 读取文件
                        (err) => { if (err) throw err }
                    )
                });
            })

            // 删除文件
            const delFile = () => {
                fs.readdir(chunksPath, (err, files) => {
                    if (err) throw err
                    if (!files.length) {
                        delFile()
                    } else {
                        files.map(res => {
                            fs.unlinkSync(path.join(chunksPath, res), (e) => { if (err) throw err });
                        })
                    }
                })
            }
            await delFile()

            // 删除文件夹
            const del = () => {
                // 判断子文件是否为空
                fs.readdir(chunksPath, (err, files) => {
                    if (files.length != 0) {
                        del()
                    } else {
                        // 为空则删除文件夹
                        fs.rmdir(chunksPath, (err) => { if (err) throw err })
                    }
                })
            }
            await del()
        }, 500)
    },
    filename: function (req, file, cb) {
        const split = file.originalname.split('.')
        cb(null, `${split[0]}-${split[1]}`) // 文件名
    },
    limits:10000000000000000000000
});

let upload = multer({ storage: storage });

let app = express()

// 解决跨域
app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true')
    res.header('Access-Control-Allow-Origin', req.headers.origin)
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Token, Accept, X-Requested-With')
    next()
})

app.use('/public/', express.static(path.join(__dirname, 'public')))

app.use('/upload', upload.single('file'), function (req, res, next) {
    if (req.file) res.send(true)
})

app.listen(3000, () => console.log('Example app listening on port 5000!'))