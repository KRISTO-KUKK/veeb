const express = require("express");
const dateET = require("./src/dateTimeET");
const fs = require("fs");
//päringu lahtiharutaja POST jaoks
const bodyparser = require("body-parser");
//SQL andmebaasi moodul
const mysql = require("mysql2");
const dbInfo = require("../../vp2025config");
const textRef = "./public/txt/vanasonad.txt";
const textRef2 = "./public/txt/visitlog.txt";
//käivitan express.js funktsiooni ja panen nimeks "app"
const app = express();
//määran veebilehtede mallide renderdamise mootori (view-engine)
app.set("view engine", "ejs");
//määran ühe päris kataloogi avalikult kättesaadavaks
app.use(express.static("public"));
//parsime päringu URL-i, lipp false, kui ainult tekst ja true, kui muid andmeid kataloogi
app.use(bodyparser.urlencoded({extended: false}));

//loon andmebaasi ühenduse
const conn = mysql.createConnection({
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
});

app.get("/", (req, res)=>{
	//res.send("Express.js käivitus ja serveerib veebi");
	res.render("index");
});

app.get("/timenow", (req, res)=>{
	const weekDayNow = dateET.weekDay();
	const dateNow = dateET.fullDate();
	res.render("timenow", {weekDayNow: weekDayNow, dateNow: dateNow});
});

app.get("/vanasonad", (req, res)=>{
	let folkWisdom = [];
	fs.readFile(textRef, "utf8", (err, data)=>{
			if(err){
				//kui tuleb viga, siis ikka väljastame veebilehe ilma vanasönadeta
				res.render("genlist", {heading: "Valik Eesti vanasõnu", listData: ["Ei leidnud ühtegi vanasõna!"]});
			} else {
				folkWisdom = data.split(";");
				res.render("genlist", {heading: "Valik Eesti vanasõnu", listData: folkWisdom});
			}
	});
});

app.get("/visitlog", (req, res)=>{
	let visitlog = [];
	fs.readFile(textRef2, "utf8", (err, data)=>{
			if(err){
				res.render("visitlog", {heading: "Registreeritud kasutajad", listData: ["Ei leidnud ühtegi kasutajat"]});
			} else {
				visitlog = data.split("\n");
				let correctListData = [];
				for(let i = 0; i < visitlog.length - 1; i ++){
					correctListData.push(visitlog[i]);
				}
				res.render("visitlog", {heading: "Registreeritud kasutajad", listData: correctListData});
			}
	});
});

app.get("/regvisit", (req, res)=>{
	res.render("regvisit");
});

app.post("/regvisit", (req, res)=>{
	res.render("regvisit");
});

app.get("/Eestifilm", (req, res)=>{
	res.render("eestifilm");
});

app.get("/Eestifilm/inimesed_add", (req, res)=>{
	res.render("filmiinimesed_add", {notice: "ootan sisestust"});
});

app.post("/Eestifilm/inimesed_add", (req, res)=>{
	console.log(req.body);
	//kas andmed on olemas
	if(!req.body.firstNameInput || !req.body.firstNameInput || !req.body.bornInput || req.body.firstNameInput >= new Date()){
		res.render("filmiinimesed_add", {notice: "Andmeid on puudu vöi ebakorrektsed"});
	} else {
		let sqlReq = "INSERT INTO person (first_name, last_name, born, deceased) VALUES (?,?,?,?)";
		conn.execute(sqlReq, [req.body.firstNameInput, req.body.lastNameInput, req.body.bornInput, req.body.deceasedInput], (err, sqlres)=>{
			if(err){
				res.render("filmiinimesed_add", {notice: "andmete salvestamine ebaönnestus"});
			} else {
				res.render("filmiinimesed_add", {notice: "salvestamine önnestus"});
			}
		});
	}
});

app.get("/Eestifilm/ametid_add", (req, res)=>{
	res.render("ametid_add", {notice: "ootan sisestust"});
});

app.post("/Eestifilm/ametid_add", (req, res)=>{
	console.log(req.body);
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
});

app.get("/Eestifilm/inimesed", (req, res)=>{
	const sqlReq = "SELECT * FROM person";
	conn.execute(sqlReq, (err, sqlres)=>{
		if(err){
			throw(err);
		} else {
			console.log(sqlres);
			res.render("filmiinimesed", {personList: sqlres});
		}
	});
});

app.get("/Eestifilm/ametid", (req, res)=>{
	const sqlReq = "SELECT * FROM position";
	conn.execute(sqlReq, (err, sqlres)=>{
		if(err){
			throw(err);
		} else {
			console.log(sqlres);
			res.render("ametid", {positionList: sqlres});
		}
	});
});

app.post("/Eestifilm/filmid", (req, res)=>{
	console.log(req.body);
	//kas andmed on olemas
	if(!req.body.titleInput || !req.body.yearInput || !req.body.durationInput){
		res.render("filmid", {notice: "Andmeid on puudu vöi ebakorrektsed"});
	} else {
		let sqlReq = "INSERT INTO movie (title, production_year, duration) VALUES (?,?,?)";
		conn.execute(sqlReq, [req.body.titleInput, req.body.yearInput, req.body.durationInput], (err, sqlres)=>{
			if(err){
				res.render("filmid", {movieList: sqlres, notice: "andmete salvestamine ebaönnestus"});
			} else {
				res.render("filmid", {movieList: sqlres, notice: "salvestamine önnestus"});
			}
		});
	}
});

app.get("/Eestifilm/filmid", (req, res)=>{
	const sqlReq = "SELECT * FROM movie";
	conn.execute(sqlReq, (err, sqlres)=>{
		if(err){
			throw(err);
		} else {
			console.log(sqlres);
			res.render("filmid", {movieList: sqlres, notice: ""});
		}
	});
});

app.post("/salvestatud", (req, res)=>{
	console.log(req.body);
	//avan teksifaili kirjutamiseks sellisel moel, et kui teda pole siis luuakse
	fs.open("public/txt/visitlog.txt", "a", (err, file)=>{
			if(err){
				throw(err);
			} else {
				//faili senisene sisule lisamine
				fs.appendFile("public/txt/visitlog.txt", req.body.firstNameInput + " " + req.body.lastNameInput + ", " + dateET.fullDate() + " kell " + dateET.fullTime() +  " \n", (err)=>{
					if(err){
						throw(err);
					} else {
						console.log("Salvestatud!");
						res.render("salvestatud", {firstNameInput: req.body.firstNameInput, lastNameInput: req.body.lastNameInput});
					}
				});
			}
	});
});

app.listen(5106);