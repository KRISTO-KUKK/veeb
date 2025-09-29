const express = require("express");
const dateET = require("./src/dateTimeET");
const fs = require("fs");
//päringu lahtiharutaja POST jaoks
const bodyparser = require("body-parser");
const textRef = "./public/txt/vanasonad.txt";
//käivitan express.js funktsiooni ja panen nimeks "app"
const app = express();
//määran veebilehtede mallide renderdamise mootori (view-engine)
app.set("view engine", "ejs");
//määran ühe päris kataloogi avalikult kättesaadavaks
app.use(express.static("public"));
//parsime päringu URL-i, lipp false, kui ainult tekst ja true, kui muid andmeid kataloogi
app.use(bodyparser.urlencoded({extended: false}));

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

app.get("/regvisit", (req, res)=>{
	res.render("regvisit");
});

app.post("/regvisit", (req, res)=>{
	console.log(req.body);
	//avan teksifaili kirjutamiseks sellisel moel, et kui teda pole siis luuakse
	fs.open("public/txt/visitlog.txt", "a", (err, file)=>{
			if(err){
				throw(err);
			} else {
				//faili senisene sisule lisamine
				fs.appendFile("public/txt/visitlog.txt", req.body.nameInput + " \n", (err)=>{
					if(err){
						throw(err);
					} else {
						console.log("Salvestatud!");
						res.render("regvisit");
					}
				});
			}
	});
});

app.listen(5106);