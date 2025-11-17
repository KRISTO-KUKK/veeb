const mysql = require("mysql2/promise");
const dbInfo = require("../../../vp2025config");
const argon2 = require("argon2");

const dbConf = {
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
};

//@desc home page for signup
//@route GET /signup
//@access public

const signupPage = (req, res)=>{
	res.render("signup", {notice: "ootan andmeid"});
};

//@desc home page for creating user account, signup
//@route POST /signup
//@access public

const signupPagePost = async (req, res) =>{
	let conn;
	console.log(req.body);
	//andmete valideerimine
	if(
	!req.body.firstNameInput || 
	!req.body.lastNameInput || 
	!req.body.birthDateInput || 
	!req.body.genderInput || 
	!req.body.emailInput ||
	req.body.passwordInput < 8 ||  
	req.body.passwordInput !== req.body.confirmPasswordInput) {
		let notice = "andmeid on puudu või miski on vigane!";
		console.log("Andmeid on puudu või miski on vigane");
		return res.render("signup", {notice: notice});
	}
	try {
		conn = await mysql.createConnection(dbConf);
		//krüpteerime passwordi 
		const pwdHash = await argon2.hash(req.body.passwordInput);
		console.log(pwdHash);
		console.log(pwdHash.length);
		
		let sqlReq = "INSERT INTO users (first_name, last_name, birth_date, gender, email, password) VALUES (?,?,?,?,?,?)";
		
		const [result] = await conn.execute(sqlReq, [req.body.firstNameInput, req.body.lastNameInput, req.body.birthDateInput, req.body.genderInput, req.body.emailInput, pwdHash]);
		console.log("Salvestati kasutaja: " + result.insertId)
		res.render("signup", {notice: "Andmed salvestati!"});
	}
	catch(err){
		console.log(err);
		res.render("signup", {notice: "Tehniline viga"});
	}
	finally {
		if(conn){
			await conn.end();
			console.log("DB suletud");
		}
	}
};

module.exports = {
	signupPage,
	signupPagePost
}