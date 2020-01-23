# image-resize
nodejs image-resize rest api

# INSTALL 
1. clone repository
2. run npm install
3. run node app.js


# ENDPOINTS
- /image/stats - give stats about the service
- /image/lfc.jpg?size=250x250 - resize lfc.jpg to 250x250 
- /image/lfc.jpg?size=250x250&format=png - resize lfc.jpg to 250x250 and convert it to png
- /image/stats/lfc.jpg - give stats about particular image lfc.jpg
