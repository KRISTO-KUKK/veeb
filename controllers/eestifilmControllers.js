const mysql = require("mysql2/promise");
const dbInfo = require("../../../vp2025config");

const dbConf = {
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
};

//@desc home page for Estonian Film section
//@route GET /Eestifilm
//@access public

//app.get("/Eestifilm", (req, res)=>{
const eestifilm = (req, res)=>{
	res.render("eestifilm");
};

//@desc page for people involved in Estonian Film industry
//@route GET /Eestifilm/inimesed
//@access public

//app.get("/Eestifilm/inimesed", async (req, res)=>{
const inimesed = async (req,res) =>{
	let conn;
	const sqlReq = "SELECT * FROM person";
	try {
		conn = await mysql.createConnection(dbConf);
		console.log("DB ühendus alustatud");
		const [rows, fields] = await conn.execute(sqlReq);
		res.render("filmiinimesed", {personList: rows});
	}
	catch {
		console.log("Viga!");
		res.render("filmiinimesed", {personList: []});
	}
	finally {
		if(conn){
			await conn.end();
			console.log("DB ühendus katkestatud");
		}
	}
};

//@desc page for adding people in Estonian Film industry
//@route GET /Eestifilm/inimesed_add
//@access public

//app.get("/Eestifilm/inimesed_add", (req, res)=>{
const inimesedAdd = (req, res) =>{
	res.render("filmiinimesed_add", {notice: "ootan sisestust"});
};

//@desc page for adding people in Estonian Film industry
//@route POST /Eestifilm/inimesed_add
//@access public

//app.post("/Eestifilm/inimesed_add", async (req, res)=>{
const inimesedAddPost = async (req, res) =>{
	let conn;
	let sqlReq = "INSERT INTO person (first_name, last_name, born, deceased) VALUES (?,?,?,?)";
	
	if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.bornInput || req.body.bornInput >= new Date()){
	  res.render("filmiinimesed_add", {notice: "Osa andmeid oli puudu või ebakorrektsed"});
	}
	
	else {
		try {
			conn = await mysql.createConnection(dbConf);
			console.log("Andmebaasiühendus loodud!");
			let deceasedDate = null;
			if(req.body.deceasedInput != ""){
				deceasedDate = req.body.deceasedInput;
			}
			const [result] = await conn.execute(sqlReq, [req.body.firstNameInput, req.body.lastNameInput, req.body.bornInput, deceasedDate]);
			console.log("Salvestati kirje: " + result.insertId);
			res.render("filmiinimesed_add", {notice: "Andmed salvestatud"});
		}
		catch(err) {
			console.log("Viga: " + err);
			res.render("filmiinimesed_add", {notice: "Andmete salvestamine ebaönnestus"});
		}
		finally {
			if(conn){
			await conn.end();
				console.log("Andmebaasiühendus on suletud!");
			}
		}
	}
};

const ametidAdd = (req, res)=>{
	res.render("ametid_add", {notice: "ootan sisestust"});
};

//app.post("/Eestifilm/ametid_add", (req, res)=>{
const ametidAddPost = async (req, res)=>{
	console.log(req.body);
	conn = await mysql.createConnection(dbConf);
	//kas andmed on olemas
	if(!req.body.positionNameInput || !req.body.descriptionInput){
		res.render("ametid_add", {notice: "Andmeid on puudu vöi ebakorrektsed"});
	} else {
		let sqlReq = "INSERT INTO position (position_name, description) VALUES (?,?)";
		conn.execute(sqlReq, [req.body.positionNameInput, req.body.descriptionInput], (err, sqlres)=>{
			if(err){
				res.render("ametid_add", {notice: "andmete salvestamine ebaönnestus"});
				console.log(err);
			} else {
				res.render("ametid_add", {notice: "salvestamine önnestus"});
			}
		});
	}
};

//app.get("/Eestifilm/ametid", (req, res)=>{
const ametid = async (req, res)=>{
	const sqlReq = "SELECT * FROM position";
	conn = await mysql.createConnection(dbConf);
	conn.execute(sqlReq, (err, sqlres)=>{
		if(err){
			throw(err);
		} else {
			console.log(sqlres);
			res.render("ametid", {positionList: sqlres});
		}
	});
};

module.exports = {
	eestifilm,
	inimesed,
	inimesedAdd,
	inimesedAddPost,
	ametid,
	ametidAdd,
	ametidAddPost
}