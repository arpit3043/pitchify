const multer=require('multer');
const path=require('path');

//setting up multer first
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads/');//tmp storage for media before cloud update
    },
    filename:(req,file,cb)=>{
        cb(null,`${Date.now()}-${file.originalname}`);
    },
});

//filtering for video/image only
const filterFile=(req,file,cb)=>{
    const allowedFileType=['image/jpeg','image/png','image/gif','image/mp4'];
    if(allowedFileType.includes(file.mimetype)){
        cb(null,true);
    }else{
        cb(new Error('Unsupported File Format'),false);
    }
};

const upload=multer({storage,filterFile});


module.exports=upload;