exports.getExtension = (file) => {
    let i = file.lastIndexOf('.')
    return (i < 0) ? '' : file.substr(i+1)
}
