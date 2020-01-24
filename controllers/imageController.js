const fs = require('fs')
//or in typescript: import * as fs from 'fs';
const sharp = require('sharp')
const pathfile = require('path')

const db = require('../models/cache')
const utils = require('../utils/utils')

const path = __dirname + '/../data/images'
const supportedFormats = ['heic', 'heif', 'jpeg', 'jpg', 'png', 'raw', 'tiff', 'webp']

exports.resize = (req, res) => {
   
    try {
    
        // format supported heic, heif, jpeg, jpg, png, raw, tiff, webp
        
        const image = req.params.image
        const size = req.query.size
        
        let format = req.query.format
    
        if(!size){
            throw new Error('invalid size parameter');
        }
        
        // we need integer but since the query params are optional we need to do some checks
        let width, height
        let sizes = size.split("x");
        width = parseInt(sizes[0])
        height = parseInt(sizes[1])
        
        // if no format specified we will use the original file format
        if(!format){
            format = utils.getExtension(image)
        }
        
        if(-1 == supportedFormats.indexOf(format)){
            res.statusCode = 400
            res.send('Invalid image format:' + format)
            return
        }
        
        // generate cache file name
        /*let cachekey = image + '_' + width + 'x' + height + '.' + format
        let cachefile = path +'/resized/' + cachekey*/
        
        let cachekey = width + 'x' + height + '.' + format
        let cachefile = path +'/resized/' + image + '/' + format + '/' + cachekey
        
        // console.log(cachefile);
        
        // check if a cache file exists and serve it
        if (fs.existsSync(cachefile)) {
            
            console.log('CACHE HIT')
            //TODO : store the cache hit per image
            db.increaseCacheHits(image, size, format)
            
            // set the response content type
            res.type(`image/${format}`)
            res.setHeader("X-Cache", "true")
            res.sendFile(pathfile.resolve(cachefile))
            return
            
        }
        
        let imagepath = path + '/' + image
        let cacheimagedir = path +'/resized/' + image 
        
        // if original image exists then try to resize it
        if (fs.existsSync(imagepath)) {
            
            // console.log('not cached')
            
            //resize image process
            let newimage = sharp(path + '/' + image).
                toFormat(format).
                resize(width, height)
                
            // generate folder structure for caching only if format is supported
            !fs.existsSync(cacheimagedir) && fs.mkdirSync(cacheimagedir)
            !fs.existsSync(cacheimagedir + '/' + format) && fs.mkdirSync(cacheimagedir + '/' + format)
            
            // init cache in db
            db.insertCache(image, size, format)
            
            // cache the new image and return it to client
            newimage.toFile(cachefile, function(err){
                if(err){
                    res.sendStatus(500)
                    return
                }
                res.setHeader("X-Cache", "false")
                res.type(`image/${format}`)
                res.sendFile(pathfile.resolve(cachefile))
                return
            });
          
        }else{
            
            res.statusCode = 400
            res.send('Image not found')
            return
        
        }
    
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
        return
    }
}

exports.stats = (req, res) => {
    try{
        
        let totalFiles = 0    
        let totalFilesResized = 0    
        
        // recursive function to get count of resized images
        // i choose the dir scan way instead of storing in a db because i wanted to offer real data
        // if someone delete manualy from server the files
        const readDirectorySynchronously = (directory) => {
            fs.readdirSync(directory).forEach(file => {
                var pathOfCurrentItem = pathfile.join(directory + '/' + file)
                if (fs.statSync(pathOfCurrentItem).isFile()) {
                    let fileext = utils.getExtension(file)
                    if(-1 != supportedFormats.indexOf(fileext)){
                        totalFilesResized++
                    }
                }
                else{
                    readDirectorySynchronously(pathOfCurrentItem);
                }
            });
        }
                
        //sync
        fs.readdirSync(path).forEach(file => {
            let stats = fs.statSync(path + '/' + file)
            if(!stats.isDirectory()){
                totalFiles++ 
            }else{
                var baseFolder = path + '/' + file
                readDirectorySynchronously(baseFolder)
                // console.log(filesCollection)
            }
        })
        
        const sharpStats = sharp.cache()
        
        let response = {
            "original" : totalFiles,
            "resized" : totalFilesResized,
            "cache" : {
                "hit" : 0,
                "miss" : 0,
            },
            "sharp" : sharpStats,
        }
        
        db.getCacheHits((hits, misses) => {
            response.cache.hit = hits
            response.cache.miss = misses
            // console.log(value)
            res.type(`application/json`)
            res.write(JSON.stringify(response))
            res.end()
        })
        
        return
        
    }catch(e){
        res.sendStatus(500)
        return
    }
}

exports.imageStats = (req, res) => {
    
    const image = req.params.image
    // res.send('image ' + image)
    
    //async
    /*fs.readdir( path, (error, files) => { 
        files.forEach(file => {
            console.log(file)
            fs.stat(path + '/' + file, (err, stats) => {
                if(!stats.isDirectory()){
                    totalFiles++ 
                    console.log(totalFiles)
                }
            })
        })
        
    })*/
    let response = {
        image : {}
    }
    //sync
    fs.readdirSync(path + '/resized/' + image).forEach(format => {
        response.image[format] = [];
        fs.readdirSync(path + '/resized/' + image + '/' + format).forEach(file => {
            response.image[format].push(file)
        })
    })
    res.write(JSON.stringify(response))
    res.end()
    
    
}
