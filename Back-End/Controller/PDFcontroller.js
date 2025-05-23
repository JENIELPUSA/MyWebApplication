const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const PDFDocument = require('pdfkit');
const path=require('path');
const fs = require('fs');

const pdfDir = path.join(__dirname, "generated-pdfs");
if(!fs.existsSync(pdfDir)){
    fs.mkdirSync(pdfDir);
}

exports.GeneratePDF=async(req,res,title,content)=>{
    

    if(!title || !content){
        return res.status(400).json({ error: "Title and content is required" });
    }

    const doc = new PDFDocument();

    const fileName = `output_${Date.now()}.pdf`;
    const filePath = path.join(pdfDir, fileName);

    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);
    doc.fontSize(20).text(title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(content);

    doc.end();

    writeStream.on("finish", () => {
        res.status(200).json({
            message: "PDF is Generated",
            downloadLink: `http://127.0.0.1:3000/GeneratePDF/download?file=${fileName}`
        })
    });

    writeStream.on("error", () => {
        res.status(500).json({ error: "Failed to Generate PDF" })
    })
}

exports.DownloadPDF=AsyncErrorHandler(async(req,res)=>{
    const fileName = req.query.file;

    if(!fileName){
        return res.status(400).json({ error: "file name is required" });
    }

    const filePath = path.join(pdfDir,fileName);
    if(!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "file Not found" });
    }

    res.download(filePath, fileName, (err) => {
        if(err){
            res.status(500).json({ error: 'Failed to download file' })
        }
    });
})