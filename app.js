const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()
const port = 3000
const multer  = require('multer');
var upload = multer({ dest: './uploads'}) // 文件储存路径
var cors = require('cors'); 
app.use(cors()); 
var gm = require('gm'); 
let file_path = '';
let file = gm(file_path);
file.options({
    appPath: 'D:\BaiduNetdisk\GraphicsMagick-1.3.34-Q16'
});
var imageMagick = gm.subClass({ imageMagick: true });
// var router = require('./uoload.js')
app.use(express.static('./public'))
app.get('/', (req, res) => {
       res.setHeader("Content-Type","utf-8'");
        fs.readFile('./index.html','utf-8',(err,data)=>{
            if(err) return '';
             res.end(data)
        })

})
app.get('/2',(req, res)=>{
  res.send({err:0,msg:'上传ok'})
})
app.post('/img', upload.single('files'),function (req, res) {
  fs.readFile(req.file.path,(err,data)=>{
    //读取失败，说明没有上传成功
        if(err){return res.send('上传失败')}  
     //否则读取成功，开始写入
     //我们先尝试用原文件名originalname写入吧
     // 三个参数
     //1.图片的绝对路径
     //2.写入的内容
     //3.回调函数  
     console.log()

     var pa = path.join(__dirname,'./public'+req.file.originalname);
          fs.writeFile(pa,data,(err)=>{
            if(err){return res.send('写入失败')}
             res.send({err:0,msg:'上传ok'})
             deleteFile('./Uploads/'+req.file.filename,false)  //删除文件
            // fs.unlink(path.join(__dirname,'./Uploads/'+req.file.filename),function(err){
            //   if(err){
            //    res.send({err:1,msg:'删除失败'})
            //   }else{
            //     console.log('delete ok');
            //   }
            // })
      })
    })
  })
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

function deleteFile(delPath, direct) {
  delPath = direct ? delPath : path.join(__dirname, delPath)
  try {
      /**
       * @des 判断文件或文件夹是否存在
       */
      if (fs.existsSync(delPath)) {
          fs.unlinkSync(delPath);
      } else {
          console.log('inexistence path：', delPath);
      }
  } catch (error) {
      console.log('del error', error);
  }
}