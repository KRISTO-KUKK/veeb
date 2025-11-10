const express = require("express");
const dateET = require("./src/dateTimeET");
const fs = require("fs");
const dbInfo = require("../../vp2025config");
//päringu lahtiharutaja POST jaoks
const bodyparser = require("body-parser");
//SQL andmebaasi moodul
//const mysql = require("mysql2");
//kuna kasutame async, impordime mysql2/promise mooduli
const mysql = require("mysql2/promise");

//const dbInfo = require("../../vp2025config");
const textRef = "./public/txt/vanasonad.txt";
const textRef2 = "./public/txt/visitlog.txt";
//käivitan express.js funktsiooni ja panen nimeks "app"
const app = express();
//määran veebilehtede mallide renderdamise mootori (view-engine)
app.set("view engine", "ejs");
//määran ühe päris kataloogi avalikult kättesaadavaks
app.use(express.static("public"));
//parsime päringu URL-i, lipp false, kui ainult tekst ja true, kui muid andmeid kataloogi
//kui tuleb vormist ainult tekst, siis false, muidu true
app.use(bodyparser.urlencoded({extended: true}));


const dbConf = {
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
};

app.get("/", async (req, res) => {
  let conn;
  const sqlLatestPublic = "SELECT filename, alttext FROM galleryphotos WHERE id=(SELECT MAX(id) FROM galleryphotos WHERE privacy=? AND deleted IS NULL)";

  try {
    conn = await mysql.createConnection(dbConf);
    const [rows] = await conn.execute(sqlLatestPublic, [3]);
    const photoName = rows.length ? rows[0].filename : null;

    res.render("index", { photoName });
  } catch (err) {
    console.error(err);
    res.render("index", { photoName: null });
  } finally {
    if (conn) {
      await conn.end();
      console.log("DB suletud");
    }
  }
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

//Eesti filmi marsruudid
const eestifilmRouter = require("./routes/eestifilmRoutes");
app.use("/Eestifilm", eestifilmRouter);

//Galerii fotode üleslaadimine
const photoupRouter = require("./routes/photoupRoutes");
app.use("/galleryphotoupload", photoupRouter);

app.listen(5106);