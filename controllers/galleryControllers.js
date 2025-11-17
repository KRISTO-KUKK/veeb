const mysql = require("mysql2/promise");
const dbInfo = require("../../../vp2025config");
const fs = require("fs").promises;
const sharp = require("sharp");

const dbConf = {
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
};

//@desc home page for displaying uploaded photos
//@route GET /galleryPage
//@access public

const galleryPage = async (req, res)=>{
/* 	let conn;
	const sqlReq = "SELECT filename FROM galleryphotos WHERE privacy = ? AND deleted IS null";
	try{
		conn = await mysql.createConnection(dbConf);
		let sqlReq = "SELECT filename, alttext FROM galleryphotos WHERE privacy >= ? AND deleted IS NULL";
		const privacy = 2;
		const [rows, fields] = await conn.execute(sqlReq, [privacy]);
		console.log(rows);
		let galleryData = [];
		for (let i = 0; i < rows.length; i ++){
			let altTtext = "Galeriipilt";
			if(rows[i].alttext != ""){
				altText = rows[i].alttext;
			}
			galleryData.push({href: rows[i].filename, alt: altText});
		}
		res.render("gallery", {galleryData: galleryData, imagehref: "/gallery/thumbs/"});
	}
	catch(err) {
		throw(err);
		res.render("gallery", {galleryData: "Ei saanud pilte laadida"});
	}
	finally {
		if(conn){
			await conn.end();
			console.log("DB suletud");
		}
	} */
	res.redirect("/gallery/1");
};

const galleryPager = async (req, res)=>{
	let conn;
	const photoLimit = 6;
	const privacy = 2;
	//const sqlReq = "SELECT filename FROM galleryphotos WHERE privacy = ? AND deleted IS null LIMIT ?";
	let page = parseInt(req.params.page);
	try{
		//kontrollin, et poleks liiga väike lehekülg
		if(page < 1 || isNaN(page)){
			page = 1;
		}
		//vaatame, palju fotosid on
		conn = await mysql.createConnection(dbConf);
		let sqlReq = "SELECT COUNT(id) AS photos FROM galleryphotos WHERE privacy >= ? AND DELETED IS NULL";
		const [countResult] = await conn.execute(sqlReq, [privacy]);
		const photoCount = countResult[0].photos;
		//parandame lk nr kui see on valitud liiga suur
		if((page -1) * photoLimit >= photoCount){
			page = Math.max(1, Math.ceil(photoCount / photoLimit));
		}
		
		let skip = (page - 1) * photoLimit;
		
		//navigatsiooni loomine
		//eelmine leht
		if(page === 1){
			galleryLinks = "Eelmine leht &nbsp;&nbsp;&nbsp;| &nbsp;&nbsp;&nbsp;";
		} else {
			galleryLinks = `<a href="/gallery/${page - 1}">Eelmine leht</a>&nbsp;&nbsp;&nbsp;| &nbsp;&nbsp;&nbsp;`;
		}
		if(page * photoLimit >= photoCount){
			galleryLinks += "Järgmine leht";
		} else {
			galleryLinks += `<a href="/gallery/${page + 1}">Järgmine leht</a>`;
		}
		console.log(galleryLinks);
		sqlReq = "SELECT filename, alttext FROM galleryphotos WHERE privacy >= ? AND deleted IS NULL LIMIT ?,?";
		const [rows, fields] = await conn.execute(sqlReq, [privacy, skip, photoLimit]);
		console.log(rows);
		let galleryData = [];
		for (let i = 0; i < rows.length; i ++){
			let altTtext = "Galeriipilt";
			if(rows[i].alttext != ""){
				altText = rows[i].alttext;
			}
			galleryData.push({href: rows[i].filename, alt: altText});
		}
		res.render("gallery", {galleryData: galleryData, imagehref: "/gallery/thumbs/", links: galleryLinks});
	}
	catch(err) {
		throw(err);
		res.render("gallery", {galleryData: "Ei saanud pilte laadida", links: ""});
	}
	finally {
		if(conn){
			await conn.end();
			console.log("DB suletud");
		}
	}
};

module.exports = {
	galleryPage,
	galleryPager
}