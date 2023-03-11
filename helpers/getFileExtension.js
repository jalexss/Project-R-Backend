
const getFileExtension = (file) => {

	return file.originalname.split('.').pop(); // -> namefile.png -> png
}


module.exports = {
	getFileExtension
}